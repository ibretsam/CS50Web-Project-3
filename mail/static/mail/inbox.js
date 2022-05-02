document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => {
    compose_email();
    history.pushState({mailbox: 'compose'}, "", `compose`);
  });

  // By default, load the inbox
  load_mailbox('inbox');

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  const mailForm = document.querySelector('#send');
  mailForm.addEventListener('click', () => {
    console.log("Button has been clicked")
  });
  
  
}

function send_email() {
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  });
  
}

function load_mailbox(mailbox) {

  window.onpopstate = function() {
    load_mailbox(mailbox);
  }

  document.querySelector('#mail-body').innerHTML = "";
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#mailbox-title').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print email
    console.log(emails);
    emails.forEach(email => {
      console.log(email.body)
      const Element = document.createElement("div");
      Element.innerHTML = ` <div class="email" data-email="${email.id}">                          
                              <p class="from">From: ${email.sender}</p>
                              <p class="sub">Subject: ${email.subject}</p>
                              <p class="content">${email.body}</p>
                              <p id="last">${email.timestamp}</p>
                            </div> 
                            `;
      document.querySelector('#mail-body').appendChild(Element);
      if (email.read == true) {
        Element.className = 'read';
      }
      else Element.className = 'unread';
      Element.addEventListener('click', () => {
        const mailState = email.id;
        history.pushState({mailID: mailState}, "", `email${mailState}`);
        showEmail(email);
      });
    });
  });
  history.pushState({mailbox: mailbox}, "", `${mailbox}`);
}

function showEmail(email) {

  // Showing an email
  fetch(`/emails/${email.id}`)
  .then(mail => mail.json())
  .then(mailDetail => {
    console.log(mailDetail);
    const Email = document.createElement("div");
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

    // Archive email
    if (email.archived == false) {
      document.querySelector('#archive').addEventListener('click', () => archive(email, true));
    }

    // Unarchive email
    else {  
      document.querySelector('#archive').addEventListener('click', () => archive(email, false));
    }

    // Reply
    document.querySelector("#reply").addEventListener('click', () => {
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'block';

      // Clear out composition fields
      document.querySelector('#compose-recipients').value = `${email.sender}`;
      document.querySelector('#compose-subject').value = `${email.subject}`;
      document.querySelector('#compose-body').value = `On ${email.timestamp}, ${email.sender} wrote: "${email.body}"`;
      
      const mailForm = document.querySelector('#send');
      mailForm.addEventListener('click', () => send_email);
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
}

function truncate(str, maxlength) {
  return (str.length > maxlength) ?
    str.slice(0, maxlength - 1) + '…' : str;
}

