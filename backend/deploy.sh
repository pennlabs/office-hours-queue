(cd "`git rev-parse --show-toplevel`";
 git add -f "backend/ohq-firebase-adminsdk.json";
 git commit -m "temp";
 git push heroku `git subtree split --prefix backend master`:master --force;
 git reset HEAD^;
 )
