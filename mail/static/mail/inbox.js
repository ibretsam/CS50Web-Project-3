document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#reply-title').innerHTML = `New Email`;

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Send mail when clicking on send button
  document.querySelector('#send').addEventListener('click', () => {
    send_email();
  })
}

function send_email() {
  let recipients = document.querySelector('#compose-recipients').value
  let subject = document.querySelector('#compose-subject').value
  let body = document.querySelector('#compose-body').value

  // Check if email has a valid address and content
  if (recipients == "" && body == "") {
    alert("Email must have recipient(s) and body");
  }

  // If recipients and body is valid, send the mail
  else {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body: body
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
    });
    localStorage.clear();
    load_mailbox('sent');
    return false;
  }
}

function load_mailbox(mailbox) {

  // Clear the current body innerHTML to create a blank new view
  document.querySelector('#mail-body').innerHTML = "";
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#mailbox-title').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Send request to mails and display it
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print email
    emails.forEach(email => {
      const Element = document.createElement("div");
      Element.innerHTML = ` <div class="email" data-email="${email.id}">                          
                              <p class="from">From: ${email.sender}</p>
                              <p class="sub">Subject: ${email.subject}</p>
                              <p class="content">${truncate(email.body, 1000)}</p>
                              <p id="last">${email.timestamp}</p>
                            </div> 
                            `;
      document.querySelector('#mail-body').appendChild(Element);

      // Marked email as read or unread for css styling later
      if (email.read == true) {
        Element.className = 'read';
      }
      else Element.className = 'unread';

      // Show email when click on an email
      Element.addEventListener('click', () => {
        showEmail(email, mailbox);
      });
    });
  });
}

function showEmail(email, mailbox) {

  // Send request and get the mail data, display it
  fetch(`/emails/${email.id}`)
  .then(mail => mail.json())
  .then(_mailDetail => {
    const Email = document.createElement("div");

    // Check if the archived status of the email is true, display the unarchive button
    if (email.archived == true) {
      Email.innerHTML = ` <div class="emailDetail" data-email="${email.id}">
                            <p><Strong>From: </Strong> ${email.sender} </p>
                            <p><Strong>To: </Strong> ${email.recipients} </p>
                            <p><Strong>Subject: </Strong> ${email.subject} </p>
                            <p><Strong>Time: </Strong> ${email.timestamp} </p>
                            <button class="btn btn-outline-primary" id="reply">Reply</button>
                            <button class="btn btn-outline-danger" id="archive">Unarchive</button><hr>
                            <p>${email.body}</p>
                          </div>`
    }
    // Check if this email is in sent mailbox, remove the archive button
    else if (mailbox == 'sent') {
      Email.innerHTML = ` <div class="emailDetail" data-email="${email.id}">
                            <p><Strong>From: </Strong> ${email.sender} </p>
                            <p><Strong>To: </Strong> ${email.recipients} </p>
                            <p><Strong>Subject: </Strong> ${email.subject} </p>
                            <p><Strong>Time: </Strong> ${email.timestamp} </p>
                            <button class="btn btn-outline-primary" id="reply">Reply</button><hr>
                            <p>${email.body}</p>
                          </div>`
    }
    // Display archive button
    else {
      Email.innerHTML = ` <div class="emailDetail" data-email="${email.id}">
                            <p><Strong>From: </Strong> ${email.sender} </p>
                            <p><Strong>To: </Strong> ${email.recipients} </p>
                            <p><Strong>Subject: </Strong> ${email.subject} </p>
                            <p><Strong>Time: </Strong> ${email.timestamp} </p>
                            <button class="btn btn-outline-primary" id="reply">Reply</button>
                            <button class="btn btn-outline-primary" id="archive">Archive</button><hr>
                            <p>${email.body}</p>
                          </div>`
    }
    document.querySelector("#mail-body").innerHTML = Email.innerHTML;

    // Archive/Unarchive email
    // Only archive/unarchive email on inbox or archived mailbox
    if (mailbox == 'inbox' || mailbox == 'archive') {
      // Archiving email
      if (email.archived == false) {
        document.querySelector('#archive').addEventListener('click', () => archive(email, true));
      }
  
      // Unarchiving email
      else {  
        document.querySelector('#archive').addEventListener('click', () => archive(email, false));
      }
    }
    

    // Reply
    document.querySelector("#reply").addEventListener('click', () => {

      // Switch to the compose view
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'block';
      document.querySelector('#reply-title').innerHTML = `Reply`;

      // Pre-fill recipients, subject and body
      document.querySelector('#compose-recipients').value = `${email.sender}`;
      document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
      document.querySelector('#compose-body').value = `On ${email.timestamp}, ${email.sender} wrote: "${email.body}
----------------------------
`;
      
      // Send email when click on send button
      const sendButton = document.querySelector('#send');
      sendButton.addEventListener('click', send_email);
    });
  });

  // Mark email as read
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
}

function archive(email, set) {
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: set
    })
  })
  console.log("email status updated")
  localStorage.clear();
  load_mailbox('inbox');
}

function truncate(str, maxlength) {
  return (str.length > maxlength) ?
    str.slice(0, maxlength - 1) + '…' : str;
}