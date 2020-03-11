# Keycloak Resources Servers

This repository shows how to use [`Resources Servers`](https://www.keycloak.org/docs/4.8/authorization_services/) with [keycloak](https://keycloak.org): By configuring keycloak correctly, a user is able to authenticate in a Web application using OpenID Connect (OIDC) and call services where authorization has been configured correctly.

In the current repository, a service exposes a REST API which can be consumed only by a single client (a Web application) as defined in the service authorization.

As a result, the workflow is:

1. A user can connect to the Web application with OIDC. An `access token` is issued.
2. The Web application get the `access token` from step 1 and uses it in HTTP requests to call REST API.
3. The REST API retrieves required information from the `access token` and validates it.
4. If everything is valid, the service is called, else the server sends back an HTTP error.

## Steps

In order to setup things correctly, follow these steps to run and configure keycloak and the services.

### keycloak

#### Launch

``` sh
docker run -e KEYCLOAK_USER=admin -e KEYCLOAK_PASSWORD=secret -p 8080:8080 jboss/keycloak
```

You will be able to login with user `admin` and password `secret` to the keycloak administration interface on http://localhost:8080.

#### Configure

1. Open http://localhost:8080
2. Login as `admin/secret`
3. Go to the [Realm creation page](http://localhost:8080/auth/admin/master/console/#/create/realm), click `Select` and choose the file `keycloak/realm.json`

This will create a realm `resource-server-realm`, an user `user1`, a client `service`, a client `webapp` and several roles at the realm and the client levels.

### Services & Webapp

#### Install dependencies

From the current directory:

```sh
# do it only the first time
npm install --global lerna
```

Install dependencies:

```sh
lerna bootstrap
```

Then launch the service and the Web application (Please make sure you configured the service before as defined in the keycloak configuration section above):

```sh
lerna run launch --stream
```

## Use

Once everything is launched, you can open the Web application at http://localhost:3000. You will be redirected to the keycloak login page where you can login with `user1/secret` credentials. Once redirected back to the Web application, it will call the service REST APIs and display the HTTP status code for each endpoint.

The authorizations defined on each enpoint are really basic but demonstrates that you can defined OIDC client as Resource Server and apply authorizations on it. Once done, your service (REST API) can be 'protected' with the help of keycloak provided libraries. In the current case, the REST API is implemented using [Express](https://expressjs.com/) and authorization is achieved using connect middleware provided by the [keycloak-connect](https://www.npmjs.com/package/keycloak-connect) module.

```js
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
```

To go further, you can play with Resources, Roles, Permissions, Policies from the client administration interface to test several rules.
