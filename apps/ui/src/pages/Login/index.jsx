import { Spinner, Text } from "@allocate-core/ui-components";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import GoogleIcon from "/icons/google.svg";
import LoginCardIcon from "/icons/loginCardIcon.svg";
import PieIcon from "/icons/pieIcon.svg";
import LoginPageBG from "/images/loginPageBG.png";
import LoginPageMobileBG from "/images/loginPageSmallBG.png";
import Logo from "/images/logo.svg";

import { authenticateUser } from "../../api/login";
import { useAuthStore } from "../../store/authStore";
import styles from "./login.module.css";

const GoogleAuthClientID = import.meta.env.CBST_GOOGLE_AUTH_CLIENT_ID;

const Login = () => {
  const navigate = useNavigate();
  const googleClient = useRef(null);

  const [isLoading, setIsLoading] = useState(false);

  const auth = useAuthStore();

  function handleCredentialResponse(response) {
    setIsLoading(true);
    authenticateUser(response)
      .then((user) => {
        auth.signIn(user, () => {
          setIsLoading(false);
          navigate("/");
        });
      })
      .catch(() => {
        setIsLoading(false);
      });
  }
  useEffect(() => {
    googleClient.current = window?.google?.accounts?.oauth2.initCodeClient({
      client_id: GoogleAuthClientID,
      scope: [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ].join(" "),
      ux_mode: "popup",
      callback: handleCredentialResponse,
    });
  }, []);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <article className={styles.loginPageContainer}>
      <img src={PieIcon} className={styles.pieIcon} alt="pie icon" aria-hidden="true" />
      <aside className={styles.photoContainer}>
        <img
          className={styles.bgImageDesktop}
          src={LoginPageBG}
          alt="Top-view of eight people sitting around a table in a meeting. Two of them are shaking hands."
        />
        <img
          className={styles.bgImageMobile}
          src={LoginPageMobileBG}
          alt="Top-view of eight people sitting around a table in a meeting. Two of them are shaking hands."
        />
      </aside>
      <section className={styles.formContainer}>
        <div className={styles.appLogo}>
          <img src={Logo} alt="CoffeeBeans Logo" />
        </div>
        <div className={styles.loginForm}>
          <div className={styles.icon}>
            <img src={LoginCardIcon} alt="login card icon" />
          </div>
          <h1 className={styles.appName}>Allocate</h1>
          <h2 className={styles.appDescription}>
            An end-to-end tool for talent planning and utilization
          </h2>
          <button
            className={`${styles.loginBtn} flex-center`}
            onClick={() => {
              googleClient.current.requestCode();
            }}
          >
            <img src={GoogleIcon} alt="Google logo" />
            <Text type="b2" fontWeight="medium">
              Sign in with Google
            </Text>
          </button>
        </div>
      </section>
    </article>
  );
};

export default Login;
