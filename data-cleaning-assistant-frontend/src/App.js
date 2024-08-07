import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import FileUpload from './FileUpload';
import ReportViewer from './ReportViewer';

function App() {
  return (
    <Router>
      <div>
        <h1>Data Cleaning Utility</h1>
        <Switch>
          <Route path="/upload" component={FileUpload} />
          <Route path="/reports" component={ReportViewer} />
          <Route path="/" exact>
            <h2>Welcome! Navigate to /upload to upload files and /reports to view past reports.</h2>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
