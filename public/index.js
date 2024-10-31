console.log("Initialisation");

// Register a Service Worker.
navigator.serviceWorker.register('service-worker.js');

async function askNotificationPermission() {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
        console.log('Permission de notification accordée');
    } else {
        console.log('Permission de notification refusée');
    }
}

askNotificationPermission();
navigator.serviceWorker.ready
.then(function(registration) {
  // Use the PushManager to get the user's subscription to the push service.
  return registration.pushManager.getSubscription()
  .then(async function(subscription) {
    // If a subscription was found, return it.
    if (subscription) {
        console.log("subscription")
        console.log(subscription)
      return subscription;
    }else{
      console.log("notfound")
    }

    // Get the server's public key
    const response = await fetch('./vapidPublicKey');
    const vapidPublicKey = await response.text();
    // Chrome doesn't accept the base64-encoded (string) vapidPublicKey yet
    // urlBase64ToUint8Array() is defined in /tools.js
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    // Otherwise, subscribe the user (userVisibleOnly allows to specify that we don't plan to
    // send notifications that don't have a visible effect for the user).
    return registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    });
  });
}).then(function(subscription) {
    console.log("sub")
    console.log(subscription)
  // Send the subscription details to the server using the Fetch API.
  fetch('./register', {
    method: 'post',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({
      subscription: subscription
    }),
  });

});

function urlBase64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
 
  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);
 
  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}



function displayJobs(jobs) {
  // Sélectionne l'élément HTML `offreMain` où les offres d'emploi seront affichées
  const offreMain = document.querySelector('.offreMain');
  offreMain.innerHTML = ''; // Vide le conteneur avant d'ajouter de nouvelles offres

  // Parcourt chaque offre d'emploi et crée un élément pour l'afficher
  jobs.forEach(job => {
      // Création de l'élément principal `offreContainer` pour chaque offre
      const offreContainer = document.createElement('div');
      offreContainer.classList.add('offreContainer');

      // Remplit le contenu HTML de `offreContainer` avec les données de l'offre d'emploi
      offreContainer.innerHTML = `
          <img src="${job.image_path}" alt="icone entreprise offre">
          <h4 class="titleOffre">${job.title}</h4>
          <p class="descriptionOffre">${job.description}</p>
          <button class="postuleOffre">Postulez</button>
      `;

      // Ajoute chaque `offreContainer` au conteneur `offreMain`
      offreMain.appendChild(offreContainer);
  });
}

// Sélectionner tous les boutons avec la classe 'postuleOffre'
document.querySelectorAll('.postuleOffre').forEach(button => {
  button.addEventListener('click', function() {
      // Récupérer l'ID à partir de l'attribut data-id du bouton
      const postId = this.getAttribute('data-id');

      // Vérifier si l'ID est bien présent
      if (postId) {
          // Créer l'URL avec l'ID en paramètre
          const url = `/ajoutFav?id=${postId}`;

          // Envoyer la requête GET à l'URL
          fetch(url, {
              method: 'GET'
          })
          .then(response => response.text()) // Traiter la réponse comme du texte (ou JSON si le serveur retourne du JSON)
          .then(data => {
              console.log("Réponse du serveur:", data);          })
          .catch(error => {
              console.error("Erreur:", error);
              alert('Erreur lors de l\'ajout aux favoris.');
          });
      }
  });
});
