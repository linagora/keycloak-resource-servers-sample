const cors = require("cors");
const express = require("express");
const session = require("express-session");
const Keycloak = require("keycloak-connect");

const PORT = 3001;
const memoryStore = new session.MemoryStore();
const app = express();

app.all('/*', cors({ origin: true, credentials: true }));

app.use(session({
  secret: 'mySecret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}));

const keycloak = new Keycloak({ store: memoryStore });

app.use((req, res, next) => {
  console.log("Got a call on", req.path);
  next();
});
app.use(keycloak.middleware());

app.get('/check-sso', keycloak.checkSso(), (req, res) => {
  console.log("Check SSO");
  res.status(200).send("OK");
});

// webapp-level-role is a role defined in the webapp client
app.get("/service/client", keycloak.protect('webapp:webapp-level-role'), (req, res) => {
  res.status(200).send("OK");
});

// this role is not defined in realm, call will fail
app.get("/service/badrealmrole", keycloak.protect("realm:with-bad-role"), (req, res) => {
  console.log("Bad role, should not be called");
  res.status(200).send("OK");
});

// this role is defined in realm, call will be OK
app.get("/service/goodrealmrole", keycloak.protect("realm:with-good-role"), (req, res) => {
  console.log("Good role");
  res.status(200).send("OK");
});

const server = app.listen(PORT, () => {
  console.log(`Service is started on http://localhost:${PORT}`);
});

