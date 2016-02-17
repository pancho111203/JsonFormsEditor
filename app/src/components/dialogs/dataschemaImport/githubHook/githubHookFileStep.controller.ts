module app.dialogs.dataschemaimport {

    import IHttpService = angular.IHttpService;
    import IPromise = angular.IPromise;
    import IDialogService = angular.material.IDialogService;
    import GithubConnector = app.core.connectors.GithubConnector;
    import GithubFile = app.core.connectors.GithubFile;
    import GithubFileLevel = app.core.connectors.GithubFileLevel;

    export class GithubHookFileStepController extends AbstractWizardStep {

        public selectedFile:GithubFile;
        private wiz:AbstractWizard;
        private fileSelectorID;

        constructor(wizard:AbstractWizard, public githubConnector:GithubConnector) {
            super(wizard);
            this.wiz = wizard;

            this.fileSelectorID = githubConnector.addFileLoader();
        }

        getTitle():string {
            return "Select Data Schema";
        }

        getTemplate():string {
            return "app/src/components/dialogs/dataschemaImport/githubHook/githubHookFileStep.html";
        }

        hasNavigation():boolean {
            return true;
        }

        shallSubmit():boolean {
            return false;
        }

        hasParentFolder():boolean{
            return this.githubConnector.hasParentFolder(this.fileSelectorID);
        }

        goToParentFolder():void{
            this.githubConnector.goToParentFolder(this.fileSelectorID);
        }

        submit():IPromise<any> {
            return this.githubConnector.loadFile(this.selectedFile, this.fileSelectorID).catch((error)=> {
                this.wiz.showNotification("Invalid file selected, try with a json file.", 3000);
            });
        }

        getFiles():GithubFile[] {
            return this.githubConnector.getFileLevel(this.fileSelectorID).getFiles();
        }

        selectFile(file:GithubFile):void {
            if (file.getType() === 'tree') {
                //The file selected was a folder, go into it
                this.githubConnector.goIntoFolder(file, this.fileSelectorID);
            } else {
                this.selectedFile = file;
                // Instead of going to next step when clicking the file, the user has to click OK
                //this.wizard.next();
            }
        }

    }

}