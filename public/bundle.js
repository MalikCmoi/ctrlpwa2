/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./public/index.js":
/*!*************************!*\
  !*** ./public/index.js ***!
  \*************************/
/***/ (() => {

eval("console.log(\"Initialisation\");\r\n\r\n// Register a Service Worker.\r\nnavigator.serviceWorker.register('service-worker.js');\r\n\r\nasync function askNotificationPermission() {\r\n    const permission = await Notification.requestPermission();\r\n    if (permission === 'granted') {\r\n        console.log('Permission de notification accordée');\r\n    } else {\r\n        console.log('Permission de notification refusée');\r\n    }\r\n}\r\n\r\naskNotificationPermission();\r\nnavigator.serviceWorker.ready\r\n.then(function(registration) {\r\n  // Use the PushManager to get the user's subscription to the push service.\r\n  return registration.pushManager.getSubscription()\r\n  .then(async function(subscription) {\r\n    // If a subscription was found, return it.\r\n    if (subscription) {\r\n        console.log(\"subscription\")\r\n        console.log(subscription)\r\n      return subscription;\r\n    }else{\r\n      console.log(\"notfound\")\r\n    }\r\n\r\n    // Get the server's public key\r\n    const response = await fetch('./vapidPublicKey');\r\n    const vapidPublicKey = await response.text();\r\n    // Chrome doesn't accept the base64-encoded (string) vapidPublicKey yet\r\n    // urlBase64ToUint8Array() is defined in /tools.js\r\n    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);\r\n\r\n    // Otherwise, subscribe the user (userVisibleOnly allows to specify that we don't plan to\r\n    // send notifications that don't have a visible effect for the user).\r\n    return registration.pushManager.subscribe({\r\n      userVisibleOnly: true,\r\n      applicationServerKey: convertedVapidKey\r\n    });\r\n  });\r\n}).then(function(subscription) {\r\n    console.log(\"sub\")\r\n    console.log(subscription)\r\n  // Send the subscription details to the server using the Fetch API.\r\n  fetch('./register', {\r\n    method: 'post',\r\n    headers: {\r\n      'Content-type': 'application/json'\r\n    },\r\n    body: JSON.stringify({\r\n      subscription: subscription\r\n    }),\r\n  });\r\n\r\n});\r\n\r\nfunction urlBase64ToUint8Array(base64String) {\r\n  var padding = '='.repeat((4 - base64String.length % 4) % 4);\r\n  var base64 = (base64String + padding)\r\n    .replace(/\\-/g, '+')\r\n    .replace(/_/g, '/');\r\n \r\n  var rawData = window.atob(base64);\r\n  var outputArray = new Uint8Array(rawData.length);\r\n \r\n  for (var i = 0; i < rawData.length; ++i) {\r\n    outputArray[i] = rawData.charCodeAt(i);\r\n  }\r\n  return outputArray;\r\n}\r\n\r\n\r\n\r\nfunction displayJobs(jobs) {\r\n  // Sélectionne l'élément HTML `offreMain` où les offres d'emploi seront affichées\r\n  const offreMain = document.querySelector('.offreMain');\r\n  offreMain.innerHTML = ''; // Vide le conteneur avant d'ajouter de nouvelles offres\r\n\r\n  // Parcourt chaque offre d'emploi et crée un élément pour l'afficher\r\n  jobs.forEach(job => {\r\n      // Création de l'élément principal `offreContainer` pour chaque offre\r\n      const offreContainer = document.createElement('div');\r\n      offreContainer.classList.add('offreContainer');\r\n\r\n      // Remplit le contenu HTML de `offreContainer` avec les données de l'offre d'emploi\r\n      offreContainer.innerHTML = `\r\n          <img src=\"${job.image_path}\" alt=\"icone entreprise offre\">\r\n          <h4 class=\"titleOffre\">${job.title}</h4>\r\n          <p class=\"descriptionOffre\">${job.description}</p>\r\n          <button class=\"postuleOffre\">Postulez</button>\r\n      `;\r\n\r\n      // Ajoute chaque `offreContainer` au conteneur `offreMain`\r\n      offreMain.appendChild(offreContainer);\r\n  });\r\n}\r\n\r\n// Sélectionner tous les boutons avec la classe 'postuleOffre'\r\ndocument.querySelectorAll('.postuleOffre').forEach(button => {\r\n  button.addEventListener('click', function() {\r\n      // Récupérer l'ID à partir de l'attribut data-id du bouton\r\n      const postId = this.getAttribute('data-id');\r\n\r\n      // Vérifier si l'ID est bien présent\r\n      if (postId) {\r\n          // Créer l'URL avec l'ID en paramètre\r\n          const url = `/ajoutFav?id=${postId}`;\r\n\r\n          // Envoyer la requête GET à l'URL\r\n          fetch(url, {\r\n              method: 'GET'\r\n          })\r\n          .then(response => response.text()) // Traiter la réponse comme du texte (ou JSON si le serveur retourne du JSON)\r\n          .then(data => {\r\n              console.log(\"Réponse du serveur:\", data);          })\r\n          .catch(error => {\r\n              console.error(\"Erreur:\", error);\r\n              alert('Erreur lors de l\\'ajout aux favoris.');\r\n          });\r\n      }\r\n  });\r\n});\r\n\n\n//# sourceURL=webpack://ctrl/./public/index.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./public/index.js"]();
/******/ 	
/******/ })()
;