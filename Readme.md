
# osrs-servers

Scrapes Old School RuneScape server info via JS AST traversal

## Usage

```javascript
var download = require('osrs-servers');
download(function(err, servers){
  // ...
  // servers:

  [ { world: 338,
      members: true,
      status: 'online',
      domain: 'oldschool38',
      players: 854,
      country: 'United States',
      countryCode: 'US',
      name: 'Old School 38' },
    { world: 354,
      members: true,
      status: 'online',
      domain: 'oldschool54',
      players: 875,
      country: 'United States',
      countryCode: 'US',
      name: 'Old School 54' }] // ...
});

```

