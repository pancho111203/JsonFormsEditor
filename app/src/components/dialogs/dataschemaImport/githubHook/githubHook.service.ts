module app.dialogs.dataschemaimport {

    import ImportHook = app.dialogs.dataschemaimport.ImportHook;
    import IDialogService = angular.material.IDialogService;
    import GithubConnector = app.core.connectors.GithubConnector;
    import IQService = angular.IQService;

    export class GithubHookService implements ImportHook {

        static $inject = ['$mdDialog', 'DataschemaImportService', 'GithubConnector', '$q'];



        constructor(private $mdDialog:IDialogService, importService:DataschemaImportService, private githubConnector:GithubConnector, private $q:IQService){
            importService.registerImportHook(this);
        }

        getTitle():string {
            return "Github";
        }

        getIconFont():string {
            return "cloud_download";
        }

        openDialog(wizard:AbstractWizard):void {
            wizard.addSteps([new GithubHookLoginStepController(wizard, this.githubConnector), new GithubHookRepoStepController(wizard, this.githubConnector, this.$q), new GithubHookFileStepController(wizard, this.githubConnector), new GithubHookUISchemaStepController(wizard, this.githubConnector, this.$q)]);
            wizard.next();
        }
    }

    angular.module('app.dialogs.github').service('GithubHookService', GithubHookService);

}