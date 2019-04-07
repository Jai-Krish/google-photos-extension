# Google Oauth request

```
https://accounts.google.com/o/oauth2/v2/auth?
 scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.metadata.readonly&
 include_granted_scopes=true&
 state=state_parameter_passthrough_value&
 redirect_uri=http%3A%2F%2Foauth2.example.com%2Fcallback&
 response_type=token&
 client_id=client_id
```

`https://accounts.google.com/o/oauth2/v2/auth?scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fphotoslibrary&state=state_parameter_passthrough_value&redirect_uri=https%3A%2F%2Fphotos-extension.firebaseapp.com&response_type=token&client_id=812304807244-4a5sl466kl07ach2ts6ct45pk7i6na1l.apps.googleusercontent.com`

# Google Oauth Response

```
http://localhost/oauth2callback#
  state=state_parameter_passthrough_value&
  access_token=ya29.GlveBkpvHu7O5YWTh3wVn6tfrN-L_B3mIhhXLh_FSpbAo9J6YSrzWZJpvExkAKKRJ5RhcA7WP1Fv4navgzFW-e9XAQVsqDqA1ZMx9BKuD1avvXmGdASGTzFWtrYh&
  token_type=Bearer&
  expires_in=3600&
  scope=https://www.googleapis.com/auth/drive.metadata.readonly
```
