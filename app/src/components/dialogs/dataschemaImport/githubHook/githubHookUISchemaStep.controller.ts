module app.dialogs.dataschemaimport {

    import IHttpService = angular.IHttpService;
    import IPromise = angular.IPromise;
    import IDialogService = angular.material.IDialogService;
    import GithubConnector = app.core.connectors.GithubConnector;
    import GithubFile = app.core.connectors.GithubFile;
    import GithubFileLevel = app.core.connectors.GithubFileLevel;
    import IQService = angular.IQService;

    export class GithubHookUISchemaStepController extends AbstractWizardStep {

        public selectedFile:GithubFile;
        private wiz:AbstractWizard;
        private fileSelectorID;
        private gonnaSkip = false;

        constructor(wizard:AbstractWizard, public githubConnector:GithubConnector, private $q: IQService) {
            super(wizard);
            this.wiz = wizard;

            this.fileSelectorID = githubConnector.addFileLoader();
        }

        getTitle():string {
            return "Select UI Schema (optional)";
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
            if(this.gonnaSkip){
                var result = {
                    dataSchema: this.githubConnector.getFileLoader(this.fileSelectorID).loadedFileContents
                }
                var deferred = this.$q.defer();
                deferred.resolve(result);
                return deferred.promise;
            }
            return this.githubConnector.loadFile(this.selectedFile, this.fileSelectorID).then((res)=> {
                var result = {
                    dataSchema: this.githubConnector.getFileLoader(this.fileSelectorID).loadedFileContents,
                    uiSchema: res
                }
            }, (error)=> {
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

        canSkip():boolean{
            return true;
        }
        skip():void{
            this.gonnaSkip = true;
            this.wizard.next();
        }

    }

}