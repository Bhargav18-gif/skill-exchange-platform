// =======================
// DEBUG
// =======================
console.log("JS LOADED");

// =======================
// INIT (ONLY ONE ENTRY POINT)
// =======================
document.addEventListener("DOMContentLoaded", () => {

    const user = localStorage.getItem("user_id");

    if (!user) {
        window.location.href = "/";
        return;
    }

    loadUserData();
    initParticles(); // safe
});


// =======================
// LOAD USER DATA (SAFE)
// =======================
function loadUsers() {
    fetch("/users")
    .then(res => res.json())
    .then(data => displayData(data))
    .catch(err => console.error("Users error:", err));
}

// =======================
// DISPLAY USERS (SAFE)
// =======================
function displayData(data) {
    const container = document.getElementById("output");

    if (!container) return;

    container.innerHTML = "";

    data.forEach(user => {
        const div = document.createElement("div");
        div.className = "user-card";

        div.innerHTML = `
            <h4>${user.name || "Unknown"}</h4>
            <p>⭐ Credits: ${user.credits || 0}</p>
            <p>🎯 Wants: ${(user.skills_wanted || []).join(", ")}</p>
            <p>💡 Offers: ${(user.skills_offered || []).join(", ")}</p>
        `;

        container.appendChild(div);
    });
}


// =======================
// LOAD USERS
// =======================
function loadUserData() {
    const userId = localStorage.getItem("user_id");

    fetch(`/user/${userId}`)
    .then(res => res.json())
    .then(user => {

        const elements = {
            userName: user.name || "",
            userEmail: user.email || "",
            userCredits: user.credits || 0,
            userOffered: (user.skills_offered || []).join(", "),
            userWanted: (user.skills_wanted || []).join(", "),
            userDisplay: "👤 " + (user.name || "User")
        };

        Object.keys(elements).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.innerText = elements[id];
            } else {
                console.warn("Missing element:", id);
            }
        });

    })
    .catch(err => console.error("User load error:", err));
}


// =======================
// FIND MATCHES
// =======================
function findMatches() {
    const userId = localStorage.getItem("user_id");

    fetch(`/match/${userId}`)
    .then(res => res.json())
    .then(data => displayData(data))
    .catch(err => console.error("Match error:", err));
}


// =======================
// ADD SKILLS (SPA STYLE)
// =======================
function addSkills() {
    const userId = localStorage.getItem("user_id");

    const offeredInput = document.getElementById("skillsOffered");
    const wantedInput = document.getElementById("skillsWanted");

    if (!offeredInput || !wantedInput) {
        console.error("Input fields not found");
        return;
    }

    const skillsOffered = offeredInput.value.split(",");
    const skillsWanted = wantedInput.value.split(",");

    fetch(`/add-skills/${userId}`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            skills_offered: skillsOffered,
            skills_wanted: skillsWanted
        })
    })
    .then(res => res.json())
    .then(() => {
        showToast("Skills updated ✅");

        loadUserData();

        offeredInput.value = "";
        wantedInput.value = "";
    })
    .catch(err => console.error("Skill error:", err));
}


// =======================
// TOAST NOTIFICATION
// =======================
function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerText = message;

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 100);

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}


// =======================
// PARTICLE BACKGROUND (SAFE)
// =======================
function initParticles() {

    const canvas = document.getElementById("particles");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resize();

    let particles = [];

    for (let i = 0; i < 40; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            dx: (Math.random() - 0.5) * 0.3,
            dy: (Math.random() - 0.5) * 0.3
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.x += p.dx;
            p.y += p.dy;

            if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.dy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(99,102,241,0.5)";
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener("resize", resize);
}
window.loadUsers = loadUsers;
window.findMatches = findMatches;
window.addSkills = addSkills;