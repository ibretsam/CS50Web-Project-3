


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

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Get data from input and make a POST request to send mail
  const mailForm = document.querySelector('#send');
  mailForm.addEventListener('click', () => {
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
  })
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
                              <hr>
                              <h6>From: ${email.sender}</h6>
                              <p>Subject: ${email.subject}</p>
                              <p style="text-align: right;">${email.timestamp}</p>
                            </div> 
                            `;
      document.querySelector('#mail-body').appendChild(Element);
      Element.addEventListener('click', () => {
        const mailState = email.id;
        history.pushState({mailID: mailState}, "", `email${mailState}`)
        showEmail(email);
      });
    });
  });
}

function showEmail(email) {

  fetch(`/emails/${email.id}`)
  .then(mail => mail.json())
  .then(mailDetail => {
    console.log(mailDetail);
    const Email = document.createElement("div");
    Email.innerHTML = ` <div class="emailDetail" data-email="${email.id}">
                            <p><Strong>From: </Strong> ${email.sender} </p>
                            <p><Strong>To: </Strong> ${email.recipients} </p>
                            <p><Strong>Subject: </Strong> ${email.subject} </p>
                            <p><Strong>Time: </Strong> ${email.timestamp} </p>
                            <button class="btn btn-outline-primary">Reply</button>
                            <hr>
                            <p>${email.body}</p>
                          </div>`;
    document.querySelector("#mail-body").innerHTML = Email.innerHTML;

  });
}

