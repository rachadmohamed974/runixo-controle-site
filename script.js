/* RUNIXO CONTRÔLE — menu et formulaire de devis */

// Adresse de l'application Apps Script « Devis RUNIXO CONTRÔLE » (…/exec).
// Tant qu'elle est vide, le formulaire ouvre un e-mail pré-rempli vers controle@3aim.fr.
var DEVIS_URL = "";
var DEVIS_MAIL = "controle@3aim.fr";

(function () {
  // Menu mobile
  document.querySelectorAll(".menu-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var nav = btn.parentNode.querySelector(".nav");
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.textContent = open ? "Fermer" : "Menu";
    });
  });

  var form = document.getElementById("devis-form");
  if (!form) return;
  var out = document.getElementById("f-msg-out");

  // Pré-cocher l'offre venant de la page Registre (?offre=abonnement ou ?offre=duerp)
  try {
    var offre = new URLSearchParams(location.search).get("offre");
    if (offre === "abonnement") document.getElementById("c-abo").checked = true;
    if (offre === "duerp") document.getElementById("c-duerp").checked = true;
  } catch (e) {}

  function say(text, kind) { out.textContent = text; out.className = "form-msg " + (kind || ""); }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var missing = [].slice.call(form.querySelectorAll("[required]")).filter(function (el) {
      return el.type === "checkbox" ? !el.checked : !el.value.trim();
    });
    var mail = form.email.value.trim();
    if (missing.length) {
      say(missing[0].id === "f-ok" ? "Cochez la case d’accord pour envoyer votre demande." : "Remplissez l’entreprise, votre nom, votre téléphone et votre e-mail.", "err");
      missing[0].focus(); return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) { say("Vérifiez l’adresse e-mail.", "err"); form.email.focus(); return; }
    if (form.site_web.value) { say("Demande envoyée. Nous revenons vers vous rapidement.", "ok"); form.reset(); return; }

    var besoins = [].slice.call(form.querySelectorAll('input[name="besoin"]:checked')).map(function (c) { return c.value; }).join(", ");
    var data = {
      entreprise: form.entreprise.value.trim(), nom: form.nom.value.trim(), telephone: form.telephone.value.trim(),
      email: mail, commune: form.commune.value.trim(), quantite: form.quantite.value.trim(),
      besoins: besoins, message: form.message.value.trim()
    };

    if (!DEVIS_URL) {
      var body = "Entreprise : " + data.entreprise + "\nNom : " + data.nom + "\nTéléphone : " + data.telephone +
        "\nE-mail : " + data.email + "\nCommune : " + data.commune + "\nEngins / salariés : " + data.quantite +
        "\nBesoin : " + data.besoins + "\n\n" + data.message;
      location.href = "mailto:" + DEVIS_MAIL + "?subject=" + encodeURIComponent("Demande de devis – " + data.entreprise) + "&body=" + encodeURIComponent(body);
      say("Votre logiciel de messagerie s’ouvre avec la demande prête à envoyer.", "ok");
      return;
    }

    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true; say("Envoi en cours…");
    fetch(DEVIS_URL, { method: "POST", mode: "no-cors", body: new URLSearchParams(data) })
      .then(function () { say("Demande envoyée. Vous allez recevoir un e-mail de confirmation, et nous revenons vers vous rapidement.", "ok"); form.reset(); })
      .catch(function () { say("L’envoi n’a pas abouti. Appelez-nous au 0692 09 85 92 ou écrivez à " + DEVIS_MAIL + ".", "err"); })
      .then(function () { btn.disabled = false; });
  });
})();
