from flask import Flask, request, jsonify, render_template
from werkzeug.security import generate_password_hash, check_password_hash
from config import db
import random
import string

# =====================================
# FLASK APP
# =====================================
app = Flask(__name__)


# =====================================
# HOME PAGE
# =====================================
@app.route('/')
def home():
    return render_template('login.html')


# =====================================
# DASHBOARD PAGE
# =====================================
@app.route('/ui')
def ui():
    return render_template('index.html')


# =====================================
# REGISTER USER
# =====================================
@app.route('/register', methods=['POST'])
def register():

    data = request.json

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    # Generate Unique ID
    user_id = ''.join(
        random.choices(
            string.ascii_uppercase + string.digits,
            k=8
        )
    )

    # Hash Password
    hashed_password = generate_password_hash(password)

    # User Data
    user = {
        "user_id": user_id,
        "name": name,
        "email": email,
        "password": hashed_password,
        "skills_offered": [],
        "skills_wanted": [],
        "credits": 10
    }

    # Store in Firebase
    db.collection("users").document(user_id).set(user)

    return jsonify({
        "success": True,
        "message": "Registered successfully",
        "user_id": user_id
    })


# =====================================
# LOGIN USER
# =====================================
@app.route('/login', methods=['POST'])
def login():

    data = request.json

    user_id = data.get("user_id")
    password = data.get("password")

    user_doc = db.collection("users").document(user_id).get()

    # User Not Found
    if not user_doc.exists:
        return jsonify({
            "success": False,
            "message": "User not found"
        }), 404

    user = user_doc.to_dict()

    # Verify Password
    if check_password_hash(user["password"], password):

        return jsonify({
            "success": True,
            "message": "Login successful",
            "user_id": user_id,
            "name": user["name"]
        })

    return jsonify({
        "success": False,
        "message": "Invalid password"
    }), 401


# =====================================
# GET SINGLE USER
# =====================================
@app.route('/user/<user_id>')
def get_user(user_id):

    user_doc = db.collection("users").document(user_id).get()

    if not user_doc.exists:
        return jsonify({
            "error": "User not found"
        }), 404

    return jsonify(user_doc.to_dict())


# =====================================
# GET ALL USERS
# =====================================
@app.route('/users')
def get_users():

    users = db.collection("users").stream()

    result = []

    for user in users:

        data = user.to_dict()

        result.append({
            "user_id": user.id,
            "name": data.get("name"),
            "credits": data.get("credits", 0),
            "skills_offered": data.get("skills_offered", []),
            "skills_wanted": data.get("skills_wanted", [])
        })

    return jsonify(result)


# =====================================
# ADD SKILLS
# =====================================
@app.route('/add-skills/<user_id>', methods=['POST'])
def add_skills(user_id):

    data = request.json

    skills_offered = data.get("skills_offered", [])
    skills_wanted = data.get("skills_wanted", [])

    db.collection("users").document(user_id).update({
        "skills_offered": skills_offered,
        "skills_wanted": skills_wanted
    })

    return jsonify({
        "success": True,
        "message": "Skills updated successfully"
    })


# =====================================
# MATCH USERS
# =====================================
@app.route('/match/<user_id>')
def match_users(user_id):

    current_user_doc = db.collection("users").document(user_id).get()

    if not current_user_doc.exists:
        return jsonify([])

    current_user = current_user_doc.to_dict()

    users = db.collection("users").stream()

    matches = []

    for user in users:

        other = user.to_dict()
        other_id = user.id

        # Skip self
        if other_id == user_id:
            continue

        # Match logic
        common_skills = set(
            current_user.get("skills_wanted", [])
        ).intersection(
            set(other.get("skills_offered", []))
        )

        if common_skills:

            matches.append({
                "user_id": other_id,
                "name": other.get("name"),
                "matched_skills": list(common_skills)
            })

    return jsonify(matches)


# =====================================
# TEST FIREBASE
# =====================================
@app.route('/test-db')
def test_db():

    db.collection("test").add({
        "status": "connected"
    })

    return "Firebase Connected Successfully!"


# =====================================
# RUN APP
# =====================================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
    