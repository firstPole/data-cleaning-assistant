import boto3
from flask import Flask, request, jsonify, redirect, url_for, send_file
from flask_cors import CORS
from flask_login import LoginManager, UserMixin, login_user, logout_user, current_user, login_required
from authlib.integrations.flask_client import OAuth
import uuid
from boto3.dynamodb.conditions import Key
from io import BytesIO
from flask_mail import Mail, Message
import bcrypt
import braintree

app = Flask(__name__)
CORS(app)

# AWS Configuration
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
s3 = boto3.client('s3', region_name='us-east-1')
s3_bucket = 'your-s3-bucket-name'
sns = boto3.client('sns', region_name='us-east-1')

# Configure Braintree
app.config['BRAINTREE_ENVIRONMENT'] = 'sandbox'
app.config['BRAINTREE_MERCHANT_ID'] = 'your_merchant_id'
app.config['BRAINTREE_PUBLIC_KEY'] = 'your_public_key'
app.config['BRAINTREE_PRIVATE_KEY'] = 'your_private_key'

braintree.Configuration.configure(
    braintree.Environment.Sandbox,
    app.config['BRAINTREE_MERCHANT_ID'],
    app.config['BRAINTREE_PUBLIC_KEY'],
    app.config['BRAINTREE_PRIVATE_KEY']
)

app.config['SECRET_KEY'] = 'your_secret_key'
login_manager = LoginManager(app)
oauth = OAuth(app)

# Define database tables
users_table = dynamodb.Table('Users')
reports_table = dynamodb.Table('Reports')
verification_tokens_table = dynamodb.Table('VerificationTokens')

class User(UserMixin):
    def __init__(self, id, subscription, files_uploaded=0, files_downloaded=0, email_verified=False, phone_verified=False, failed_attempts=0, account_locked=False):
        self.id = id
        self.subscription = subscription
        self.files_uploaded = files_uploaded
        self.files_downloaded = files_downloaded
        self.email_verified = email_verified
        self.phone_verified = phone_verified
        self.failed_attempts = failed_attempts
        self.account_locked = account_locked

    def get_id(self):
        return self.id

@login_manager.user_loader
def load_user(user_id):
    response = users_table.get_item(Key={'id': user_id})
    if 'Item' in response:
        item = response['Item']
        user = User(
            id=item['id'],
            subscription=item['subscription'],
            files_uploaded=item.get('files_uploaded', 0),
            files_downloaded=item.get('files_downloaded', 0),
            email_verified=item.get('email_verified', False),
            phone_verified=item.get('phone_verified', False)
        )
        return user
    return None

@app.route('/api/braintree/token', methods=['GET'])
@login_required
def get_client_token():
    token = braintree.ClientToken.generate()
    return jsonify({'token': token})

@app.route('/api/braintree/checkout', methods=['POST'])
@login_required
def braintree_checkout():
    nonce = request.json.get('paymentMethodNonce')
    result = braintree.Transaction.sale({
        'amount': '10.00',
        'payment_method_nonce': nonce,
        'options': {
            'submit_for_settlement': True
        }
    })
    if result.success:
        return jsonify({'message': 'Payment successful'})
    else:
        return jsonify({'error': 'Payment failed'}), 400

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    response = users_table.get_item(Key={'email': email})
    if 'Item' not in response:
        return jsonify({'error': 'Invalid credentials'}), 401

    user = response['Item']
    if not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        return jsonify({'error': 'Invalid credentials'}), 401

    # Handle session management or JWT token issuance here

    return jsonify({'message': 'Login successful'})

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    # Check if user already exists
    response = users_table.get_item(Key={'email': email})
    if 'Item' in response:
        return jsonify({'error': 'User already exists'}), 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    users_table.put_item(Item={'email': email, 'password': hashed_password.decode('utf-8')})
    
    return jsonify({'message': 'Sign-up successful'})

@app.route('/api/upload', methods=['POST'])
@login_required
def upload_file():
    if current_user.subscription == 'basic' and current_user.files_uploaded >= 5:
        return jsonify({'error': 'File upload limit reached for free users'}), 403

    file = request.files.get('file')
    if not file:
        return jsonify({'error': 'No file uploaded'}), 400

    file_id = str(uuid.uuid4())
    file_path = f'{file_id}/{file.filename}'
    s3.upload_fileobj(file, s3_bucket, file_path)

    reports_table.put_item(Item={
        'id': file_id,
        'name': file.filename,
        'status': 'processed',
        'user_id': current_user.id
    })

    if current_user.subscription == 'basic':
        users_table.update_item(
            Key={'id': current_user.id},
            UpdateExpression='SET files_uploaded = files_uploaded + :inc',
            ExpressionAttributeValues={':inc': 1}
        )

    return jsonify({'message': 'File processed successfully', 'report': {'id': file_id, 'name': file.filename, 'status': 'processed'}})

@app.route('/api/reports', methods=['GET'])
@login_required
def get_reports():
    response = reports_table.query(
        IndexName='user_id-index',
        KeyConditionExpression=Key('user_id').eq(current_user.id)
    )
    reports = response.get('Items', [])
    reports_list = [{'id': report['id'], 'name': report['name'], 'status': report['status']} for report in reports]
    return jsonify({'reports': reports_list})

@app.route('/api/download/<file_id>', methods=['GET'])
@login_required
def download_file(file_id):
    if current_user.subscription == 'basic':
        if current_user.files_downloaded >= 5:
            return jsonify({'error': 'Download limit reached for free users'}), 403

    try:
        file_obj = s3.get_object(Bucket=s3_bucket, Key=file_id)
        file_stream = BytesIO(file_obj['Body'].read())
        if current_user.subscription == 'basic':
            users_table.update_item(
                Key={'id': current_user.id},
                UpdateExpression='SET files_downloaded = files_downloaded + :inc',
                ExpressionAttributeValues={':inc': 1}
            )
        return send_file(file_stream, as_attachment=True, download_name=file_id)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/upgrade', methods=['POST'])
@login_required
def upgrade_subscription():
    users_table.update_item(
        Key={'id': current_user.id},
        UpdateExpression='SET subscription = :sub',
        ExpressionAttributeValues={':sub': 'premium'}
    )
    return jsonify({'message': 'Subscription upgraded to premium'})

@app.route('/auth/google', methods=['GET'])
def google_login():
    return oauth.remote_app('google').authorize(callback=url_for('google_authorized', _external=True))

@app.route('/auth/google/callback', methods=['GET'])
def google_authorized():
    response = oauth.remote_app('google').authorized_response()
    if response is None or response.get('access_token') is None:
        return 'Access denied: reason={} error={}'.format(
            request.args.get('error_reason'),
            request.args.get('error_description')
        )

    user_info = oauth.remote_app('google').get('plus/v1/people/me')
    # Handle user login and creation based on user_info
    return redirect(url_for('index'))

@app.route('/api/feedback', methods=['POST'])
@login_required
def submit_feedback():
    feedback = request.json.get('feedback')
    if not feedback:
        return jsonify({'error': 'No feedback provided'}), 400

    print(f'Feedback from user {current_user.id}: {feedback}')
    
    return jsonify({'message': 'Feedback submitted successfully'})

@app.route('/api/send-verification-email', methods=['POST'])
def send_verification_email():
    email = request.json.get('email')
    token = str(uuid.uuid4())
    verification_tokens_table.put_item(Item={'email': email, 'token': token})

    msg = Message('Verify your email', sender='noreply@example.com', recipients=[email])
    verification_link = url_for('verify_email', token=token, _external=True)
    msg.body = f'Click on the link to verify your email: {verification_link}'
    mail.send(msg)

    return jsonify({'message': 'Verification email sent'})

@app.route('/api/verify-email/<token>', methods=['GET'])
def verify_email(token):
    response = verification_tokens_table.get_item(Key={'token': token})
    if 'Item' not in response:
        return 'Invalid or expired token'

    email = response['Item']['email']
    users_table.update_item(
        Key={'email': email},
        UpdateExpression='SET email_verified = :verified',
        ExpressionAttributeValues={':verified': True}
    )

    return 'Email verified successfully'

if __name__ == '__main__':
    app.run(debug=True)
