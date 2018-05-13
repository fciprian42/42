## Documentation API
### Users

##### Information de l'utilisateur
`GET /api/users/me`

| Type | Description |
|:------:|:-----:|
| `GET` | Récupère les informations public de l'utilisateur connecté |

<details>
  <summary>Response</summary>
	```
	{
		"lang": "EN",
		"firstName": "John",
		"lastName": "Doe",
	    "username": "jdoe",
		"email": "john@doe.co",	# TEMPORAIRE #
	}
	```
</details>

##### Update du compte de l'utilisateur
`POST /api/users/me`

| Type | Description |
|:------:|:-----:|
| `POST` | Met à jour les données de l'utilisateur |

<details>
  <summary>Response</summary>
	```
	{
		"lang": "EN",
		"firstName": "John",
		"lastName": "Doe",
	    "username": "jdoe",
		"email": "john@doe.co",	# TEMPORAIRE #
	}
	```

</details>

##### Update du compte de l'utilisateur
`POST /api/users/me`

Parametres:

| Name | Type | Required |
|:------:|:------:|:------:|
| email| `String` | `true` |
| firstName| `String` | `true` |
| lastName| `String` | `true` |

<details>
  <summary>Response</summary>
	```
	{
		"success": 'Updated'
	}
	```

</details>

##### Générer un code 2FA
`POST /api/reset/generate`

Parametres:

| Name | Type | Required |
|:------:|:------:|:------:|
| email| `String` | `true` |


<details>
  <summary>Response</summary>
  ```
{
    "success": true,
    "to": "john@doe.co",
    "generated": 012345
}
```

</details>

##### Reset du mot de passe
`POST /api/reset`

Parametres:

| Name | Type | Required |
|:------:|:------:|:------:|
| email | `String` | `true` |
| twofa | `String` | `true` |
| passwd | `String` | `true` |


<details>
  <summary>Response</summary>
  ```
{
    "success": true,
    "to": "john@doe.co",
}
```

</details>


### Movies

##### Liste des films

`GET /api/movies/find/:query`

| Type | Description |
|:------:|:-----:|
| `GET` | Récupère la liste des films |

<details>
  <summary>Response</summary>
	```
	{
	   "movies": [
		{
		    "name": "The Left Hand of God",
		    "year": "1955",
		    "link": "https://yts.am/movie/the-left-hand-of-god-1955",
		    "img": "https://yts.am/assets/images/movies/the_left_hand_of_god_1955/medium-cover.jpg"
		},
	    ],
	    "pagination": {
		"actual": "1",
		"length": "1"
	    }
	}
	```
</details>

### Profile

##### Changement du langage
`POST /api/profile/language/change`

Parametres:

| Name | Type | Required |
|:------:|:------:|:------:|
| lang | `String` | `true` |

<details>
  <summary>Response</summary>
```
{
	"success": true,
	"lang": "FR"
}
```
</details>
