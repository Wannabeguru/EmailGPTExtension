
//scrapes email subject, senders email address, and thread ID from gmail webpage.
function getEmailDetails() {
    const subject = document.querySelector('h2[data-legacy-thread-id]');
    const sender = document.querySelector('.gD');
  
    if (!subject || !sender) {
      return null;
    }
  
    return {
      subject: subject.textContent.trim(),
      sender: sender.getAttribute('email'),
      threadId: subject.getAttribute('data-legacy-thread-id'),
    };
  }
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getEmailDetails') {
      const emailDetails = getEmailDetails();
      sendResponse(emailDetails);
    }
  });
  