# Mini-spec fonctionnelle - Ticket 02

## 1. Comportement attendu
Le backoffice conserve le comportement utilisateur actuel pour les flux de consultation initiale, sauvegarde et publication (tabs, save, publish).  
Les acces donnees du front ne passent plus en CRUD direct sur les tables Supabase depuis `js/main.js` et `js/state.js`, mais via des endpoints metier (Edge Functions).  
La couche serveur devient le point unique d'application des regles metier pour les operations d'administration.  
Le format de donnees consomme par le flux de publication Firebase reste compatible, sans changement de modele metier.

## 2. Regles metier impactees
- `RM-001 (inferee)` : toute lecture initiale de donnees d'administration doit transiter par un endpoint metier serveur.
- `RM-002 (inferee)` : toute operation de sauvegarde lancee depuis le front doit transiter par un endpoint metier serveur, sans ecriture directe en table.
- `RM-003 (inferee)` : le parcours utilisateur visible (tabs, save, publish) doit rester fonctionnellement equivalent apres migration.
- `RM-004 (inferee)` : le contrat de donnees attendu par la publication Firebase doit rester compatible avec l'existant.
- `RM-005 (inferee)` : `js/main.js` et `js/state.js` ne doivent plus contenir d'appels CRUD directs vers les tables Supabase.

## 3. Criteres d'acceptation testables

### Nominal
- `CA-001`  
  Etant donne un administrateur connecte,  
  Quand l'application charge les donnees initiales,  
  Alors les donnees sont recuperees via un endpoint metier et l'ecran affiche les memes informations metier qu'avant migration.

- `CA-002`  
  Etant donne une modification valide dans le backoffice,  
  Quand l'utilisateur declenche `save()`,  
  Alors la sauvegarde est effectuee via endpoint metier et les changements persistent correctement.

- `CA-003`  
  Etant donne des donnees sauvegardees,  
  Quand l'utilisateur declenche `publish()`,  
  Alors la publication aboutit et produit un resultat compatible avec le schema attendu par Firebase.

### Alternatifs
- `CA-004`  
  Etant donne une session ou l'utilisateur navigue entre onglets avant sauvegarde,  
  Quand il revient sur un onglet deja edite puis lance `save()`,  
  Alors le comportement des tabs et la prise en compte des modifications restent equivalents a l'existant.

### Limites
- `CA-005`  
  Etant donne une sauvegarde sans modification metier effective (no-op),  
  Quand `save()` est declenche,  
  Alors la requete metier est traitee sans corruption de donnees et l'etat final reste coherent.

### Erreur
- `CA-006`  
  Etant donne une indisponibilite d'un endpoint metier (erreur 5xx ou timeout),  
  Quand une lecture initiale ou un `save()` est declenche,  
  Alors le front n'effectue aucun fallback en ecriture/lecture directe table et remonte un echec controle.

### Contrats d'interface
- `CA-007`  
  Etant donne le code source de `js/main.js` et `js/state.js`,  
  Quand on inspecte les acces donnees Supabase,  
  Alors aucun appel CRUD direct vers les tables n'est present, uniquement des appels aux endpoints metier.

- `CA-008`  
  Etant donne une execution complete du flux `publish()`,  
  Quand on valide le payload en sortie de la couche metier,  
  Alors sa structure est compatible avec le contrat attendu par la publication Firebase (champs et types attendus).

## 4. Auto-controle final
- a) Chaque `RM-XXX` a au moins un CA associe : **OK**.
- b) Chaque CA est objectivement testable (observation UI, logs/reseau, inspection code, validation payload) : **OK**.
- c) Les 5 categories sont adressees (nominal, alternatifs, limites, erreur, contrats d'interface) : **OK**.

Matrice de couverture :
- `RM-001 -> CA-001, CA-006`
- `RM-002 -> CA-002, CA-006`
- `RM-003 -> CA-003, CA-004`
- `RM-004 -> CA-003, CA-008`
- `RM-005 -> CA-007`
