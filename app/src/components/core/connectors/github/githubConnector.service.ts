module app.core.connectors {

    import IHttpService = angular.IHttpService;
    import IIntervalService = angular.IIntervalService;
    import IWindowService = angular.IWindowService;
    import IPromise = angular.IPromise;
    import IQService = angular.IQService;
    import ILocationService = angular.ILocationService;

    export class GithubConnector {

        static $inject = ['$http', '$window', '$q', '$location'];

        private url;

        private repoList;

        private fileLoaders:FileLoader[];
        private fileLevel:GithubFileLevel;

        constructor(private $http:IHttpService, private $window:IWindowService, private $q:IQService, private $location:ILocationService) {
            this.url = $location.protocol() + "://" + $location.host() + ":" + $location.port();
            this.fileLoaders = [];

            // We need one fileLoader per schema (ui-schema and data-schema)
            this.addFileLoader();
            this.addFileLoader();
        }

        addFileLoader():number {
            return this.fileLoaders.push(new FileLoader());
        }

        getFileLoader(index:number):FileLoader {
            return this.fileLoaders[index];
        }

        showPopupGithub():IPromise<any> {

            var left = screen.width / 2 - 200;
             var top = screen.height / 2 - 200;
             var popup = this.$window.open('/github/login', '', "top=" + top + ", left=" + left + ", width=400, height=500");
             var deferred = this.$q.defer();

             window.onmessage = (event) => {
             //TODO detect only pertinent message
             popup.close();
             var data = event.data;
             this.repoList = JSON.parse(data.body);
             deferred.resolve();
             };
             return deferred.promise;

        }

        getReposByQuery(query: string):IPromise<any>{
            // Search without logging in
            return this.$http.get(this.url + '/github/queryRepo?q='+query, {})
                .then((res:any)=>{
                    this.repoList = JSON.parse(res.data.body).items;
                });
        }

        getRepoList():any {
            return this.repoList;
        }

        getBranchList(repoName:string, ownerName:string):IPromise<any> {
            return this.$http.get(this.url + "/github/getBranchList?repoName=" + repoName + "&ownerName=" + ownerName, {});
        }

        getFilesFromBranch(repoName:string, branchName:string):IPromise<any> {

            return this.$http.get(this.url + "/github/getFilesFromBranch?repoName=" + repoName + "&branchName=" + branchName, {})
                .success((result:Array<any>) => {
                    this.fileLevel = new GithubFileLevel(result, null);
                });
        }

        getFileLevel():GithubFileLevel {
            return this.fileLevel;
        }

        goIntoFolder(file:GithubFile):IPromise<any> {

            if (file.getType() !== 'tree') {
                throw new Error('Calling method "goIntoFolder" with a regular file instead of a folder!');
            }
            // Here I'm reusing previously loaded fileLevels
            if (this.fileLevel) {
                var child = this.fileLevel.getChild(file.getName());
                if (child) {
                    this.fileLevel = child;

                    return this.$q.when(child);
                }
            }
            return this.$http.get(this.url + "/github/getFileLevel?url=" + file.getUrl())
                .success((result:Array<any>) => {
                    var previousLevel = this.fileLevel;
                    this.fileLevel = new GithubFileLevel(result, previousLevel);
                    previousLevel.addChild(file.getName(), this.fileLevel);
                });
        }

        goToParentFolder():void {

            this.fileLevel = this.fileLevel.getParent();
        }

        hasParentFolder():boolean {
            return this.fileLevel.hasParent();
        }

        loadFile(file:GithubFile, fileSelectorId):IPromise<any> {
            return this.$http.get(this.url + "/github/loadFile?url=" + file.getUrl())
                .then((result:any) => {
                    try {
                        var resJson = JSON.parse(atob(result.data.content));
                    } catch (error) {
                        throw new Error('Invalid Json Object! Select another one');
                    }
                    console.log(resJson);
                    this.fileLoaders[fileSelectorId].loadedFile = result.data;
                    this.fileLoaders[fileSelectorId].loadedFileContents = resJson;
                    return this.fileLoaders[fileSelectorId].loadedFileContents;
                });
        }
    }

    angular.module('app.core').service('GithubConnector', GithubConnector);
}