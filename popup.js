//replace with your own google API KEYS.
const apiKey = 'INSERT_YOUR_OWN_API_KEY_HERE';
const clientId = 'INSERT_YOUR_OWN_CLIENT_ID_HERE';

const scopes = 'https://www.googleapis.com/auth/gmail.compose';


//load and initalize Google API Client
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}



function initClient() {
    gapi.client.init({
      apiKey: apiKey,
      clientId: clientId,
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'],
      scope: scopes,
    }).then(() => {
      // Handle the initial sign-in state
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
  
      // Listen for sign-in state changes
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
    }, (error) => {
      console.error('Error during initClient:', error);
    });
  }
  

//Uses the google api client library for signIn method to authenticate user.
function authenticateUser() {
  return gapi.auth2.getAuthInstance().signIn();
}


//sends the email using the Gmail API.
function replyToEmail(message) {
  authenticateUser().then(() => {
    const email = createEmailReply(message);
    return gapi.client.gmail.users.messages.send({
      'userId': 'me',
      'resource': {
        'raw': email,
      },
    });
  }).then((response) => {
    console.log('Email sent:', response);
    alert('Email reply sent successfully!');
  }).catch((error) => {
    console.error('Error during replyToEmail:', error);
    alert('Error sending email reply. Please try again.');
  });
}


//Uses chrome extension API to communicate between the extension background page and content script running in the active tab.
function getEmailDetails() {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) {
          reject(new Error('No active tab found'));
          return;
        }
        const tab = tabs[0];
        chrome.tabs.sendMessage(tab.id, { action: 'getEmailDetails' }, (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(response);
          }
        });
      });
    });
  }

function createEmailReply(emailDetails, message) {
  // Replace the following placeholders with actual values
  const to = emailDetails.sender;
  const subject = 'Re: ' + emailDetails.subject;
  const threadId = emailDetails.threadId;

  const email =
    `To: ${to}\r\n` +
    `Subject: ${subject}\r\n` +
    `Content-Type: text/plain; charset=UTF-8\r\n` +
    `Content-Transfer-Encoding: 7bit\r\n\r\n` +
    `${message}`;

  return btoa(email)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

//update the UI based on the user's sign-in status:
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
      document.getElementById('sign-in').style.display = 'none';
      document.getElementById('replyForm').style.display = 'block';
    } else {
      document.getElementById('sign-in').style.display = 'block';
      document.getElementById('replyForm').style.display = 'none';
    }
  }

/*This code adds an event listener to an email reply form submission. It retrieves the value of an input field, 
calls the getEmailDetails() function to create an email reply, and handles any errors that may occur. 
This enables users to submit email replies with error handling.*/

document.getElementById('replyForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const message = document.getElementById('message').value;
    getEmailDetails().then((emailDetails) => {
      const email = createEmailReply(emailDetails, message);
      return replyToEmail(email);
    }).catch((error) => {
      console.error('Error fetching email details:', error);
      alert('Error fetching email details. Please make sure you have an email opened in Gmail.');
    });
  });



// Load the Google API client and authenticate the user when the window loads
window.addEventListener('load', handleClientLoad);