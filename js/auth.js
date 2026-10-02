// ========================================
// MONÉA - AUTHENTICATION
// ========================================

import {
    auth,
    db
} from "../firebase-config.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// ========================================
// PAGE INITIALIZATION
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    const loadingScreen =
        document.getElementById("loadingScreen");


    // Hide loading screen
    setTimeout(function () {

        if (loadingScreen) {

            loadingScreen.classList.add("hidden");

        }

    }, 1000);


    initializeAuthentication();

});


// ========================================
// AUTHENTICATION
// ========================================

function initializeAuthentication() {

    const loginForm =
        document.getElementById("loginForm");

    const signupForm =
        document.getElementById("signupForm");

    const showSignup =
        document.getElementById("showSignup");

    const showLogin =
        document.getElementById("showLogin");


    // ========================================
    // SHOW SIGN UP
    // ========================================

    if (showSignup) {

        showSignup.addEventListener("click", function () {

            loginForm.classList.remove("active");

            signupForm.classList.add("active");

        });

    }


    // ========================================
    // SHOW LOGIN
    // ========================================

    if (showLogin) {

        showLogin.addEventListener("click", function () {

            signupForm.classList.remove("active");

            loginForm.classList.add("active");

        });

    }


    // ========================================
    // LOGIN
    // ========================================

    const login =
        document.getElementById("login");


    if (login) {

        login.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const email =
                    document
                        .getElementById("loginEmail")
                        .value
                        .trim();


                const password =
                    document
                        .getElementById("loginPassword")
                        .value;


                if (!email || !password) {

                    alert(
                        "Please enter your email and password."
                    );

                    return;

                }


                try {

                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                    window.location.href =
                        "index.html";

                }


                catch (error) {

                    console.error(
                        "Login error:",
                        error
                    );


                    let message =
                        "Unable to sign in. Please try again.";


                    if (
                        error.code ===
                        "auth/invalid-credential"
                    ) {

                        message =
                            "Incorrect email or password.";

                    }


                    else if (
                        error.code ===
                        "auth/user-not-found"
                    ) {

                        message =
                            "No account was found with this email.";

                    }


                    else if (
                        error.code ===
                        "auth/wrong-password"
                    ) {

                        message =
                            "Incorrect password.";

                    }


                    else if (
                        error.code ===
                        "auth/invalid-email"
                    ) {

                        message =
                            "Please enter a valid email address.";

                    }


                    else if (
                        error.code ===
                        "auth/too-many-requests"
                    ) {

                        message =
                            "Too many attempts. Please try again later.";

                    }


                    alert(message);

                }

            }
        );

    }


    // ========================================
    // SIGN UP
    // ========================================

    const signup =
        document.getElementById("signup");


    if (signup) {

        signup.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const name =
                    document
                        .getElementById("signupName")
                        .value
                        .trim();


                const email =
                    document
                        .getElementById("signupEmail")
                        .value
                        .trim();


                const password =
                    document
                        .getElementById("signupPassword")
                        .value;


                const confirmPassword =
                    document
                        .getElementById("confirmPassword")
                        .value;


                // Check required fields
                if (
                    !name ||
                    !email ||
                    !password ||
                    !confirmPassword
                ) {

                    alert(
                        "Please complete all fields."
                    );

                    return;

                }


                // Check password length
                if (password.length < 6) {

                    alert(
                        "Password must be at least 6 characters."
                    );

                    return;

                }


                // Check passwords
                if (password !== confirmPassword) {

                    alert(
                        "Passwords do not match."
                    );

                    return;

                }


                try {

                    // Create Firebase account
                    const userCredential =
                        await createUserWithEmailAndPassword(
                            auth,
                            email,
                            password
                        );


                    const user =
                        userCredential.user;


                    // Save name to Firebase Authentication
                    await updateProfile(
                        user,
                        {
                            displayName: name
                        }
                    );


                    // Create Firestore user profile
                    await setDoc(
                        doc(
                            db,
                            "users",
                            user.uid
                        ),
                        {
                            name: name,
                            email: email,
                            photoURL: "",
                            createdAt: serverTimestamp()
                        }
                    );


                    alert(
                        "Your Monéa account has been created successfully!"
                    );


                    // Go to dashboard
                    window.location.href =
                        "index.html";

                }


                catch (error) {

                    console.error(
                        "Sign up error:",
                        error
                    );


                    let message =
                        "Unable to create your account.";


                    if (
                        error.code ===
                        "auth/email-already-in-use"
                    ) {

                        message =
                            "This email is already registered.";

                    }


                    else if (
                        error.code ===
                        "auth/invalid-email"
                    ) {

                        message =
                            "Please enter a valid email address.";

                    }


                    else if (
                        error.code ===
                        "auth/weak-password"
                    ) {

                        message =
                            "Your password is too weak. Please use at least 6 characters.";

                    }


                    else if (
                        error.code ===
                        "auth/network-request-failed"
                    ) {

                        message =
                            "Network error. Please check your internet connection.";

                    }


                    alert(message);

                }

            }
        );

    }

}