# Ticket 15 — Bug : date de modification des mots a chaque sauvegarde

1. **Titre** : Ne mettre a jour la date de modification d’un mot qu’au moment ou le mot est reellement modifie, pas a chaque sauvegarde globale.
2. **Probleme resolu** : Aujourd’hui, la date de modification de **tous** les mots change a chaque sauvegarde. Comportement attendu cote metier : seuls les mots effectivement edites depuis la derniere persistance devraient porter une nouvelle date (ou la semantique doit etre explicitee si l’on garde volontairement une « date de derniere publication en base »).
3. **Impact** : utilisateur/metier : perte de confiance dans le tri / le filtre par date et dans l’historique percu (« tout vient d’etre modifie »). technique : la date est probablement assignee au moment du push de chaque enregistrement plutot qu’au moment du diff reel sur l’objet mot.
4. **CA cibles** :
   - **CA-1501** : Apres une sauvegarde sans changement de contenu sur un mot donne, sa date de modification (champ expose en UI ou en payload) reste inchangee par rapport a l’etat pre-save.
   - **CA-1502** : Apres modification d’un seul mot (champs suivis par le produit), seul ce mot voit sa date de modification mise a jour ; les autres mots inchanges conservent leur date precedente.
   - **CA-1503** : Comportement documente si une sauvegarde « batch » doit quand meme toucher un horodatage global (ex. `updated_at` document) distinct du per-mot.
5. **Contraintes** :
   - Ne pas casser le flux `admin-save` / shaping des payloads existants sans migration ou versionnage si le schema stocke ces dates.
   - Aligner la semantique UI (libelle « modifie le ») avec la donnee affichee.
6. **Hors-perimetre** :
   - Historique fin des revisions par champ (diff complet multi-versions).
   - Changement du fuseau ou du format d’affichage des dates (sauf si necessaire pour le correctif).
7. **Definition de Termine** :
   - [ ] Cause identifiee (assignation systematique a la sauvegarde vs. au edit) et correctif ou regle produit validee.
   - [ ] CA-1501 et CA-1502 verifies (tests ou checklist manuelle documentee).
   - [ ] Note dans `docs/` si le contrat de date change (ex. deux champs : « modifie dans l’editeur » vs. « persiste en base »).
8. **Estimation** : M.

Auto-controle :
- Ticket atomique : oui (semantique et mise a jour des dates de modification des mots).
- CA cibles identifies : oui (CA-1501 a CA-1503).
- Hors-perimetre explicite : oui.
