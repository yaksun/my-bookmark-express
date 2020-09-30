app.controller('seditCtr', ['$scope', '$state', '$timeout', '$document', 'ngDialog', 'bookmarkService', 'pubSubService', 'dataService', function($scope, $state, $timeout, $document, ngDialog, bookmarkService, pubSubService, dataService) {
    console.log("Hello seditCtr");
    var maxSelections = 3;
    var dialog = null;
    var cancelDefault = false;
    init();

    $scope.$watch('search_url', function(newUrl, oldUrl, scope) {
        $timeout(function() {
            $scope.searchUrlError = $scope.search_url == '' && $('.ui.modal.js-add-searchUrl').modal('is active');
        });
    
    });

    $scope.$watch('title', function(newValue, oldValue, scope) {
        $timeout(function() {
            $scope.titleError = $scope.title == '' && $('.ui.modal.js-add-searchUrl').modal('is active');
        });
    });

    
    $scope.$watch('quick_key', function(newValue, oldValue, scope) {
        $timeout(function() {
            $scope.quickKeyError = $scope.quick_key == '' && $('.ui.modal.js-add-searchUrl').modal('is active');
        });
    });

      
    $scope.$watch('icon_class', function(newValue, oldValue, scope) {
        $timeout(function() {
            $scope.iconClassError = $scope.icon_class == '' && $('.ui.modal.js-add-searchUrl').modal('is active');
        });
    });

    $scope.$watch('default', function(newValue, oldValue, scope) {
        $timeout(function() {
            $scope.defaultError = $scope.default == '' && $('.ui.modal.js-add-searchUrl').modal('is active');
        });
    });

    $scope.restoreTitle = function() {
        $scope.title = $scope.originTitle;
    }

    $scope.handleCancel = function() {
        $('.ui.modal.js-add-searchUrl').modal('hide');

        init();
    }
    $scope.handleOk = function() {
        
        $scope.searchUrlError = $scope.search_url == '';
        $scope.titleError = $scope.title == '';
        $scope.quickKeyError = $scope.quick_key == '';
        $scope.iconClassError = $scope.icon_class == '';
        $scope.defaultError = $scope.default == '0';
        var params = {
            id: $scope.id,
            search_url: $scope.search_url,
            title: $scope.title,
            quick_key: $scope.quick_key,
            icon_class: $scope.icon_class,
            default: $scope.default
        }
     
        if ($scope.titleError) {
            toastr.error('书签标题不能为空！', "错误");
            return;
        }
  
            if(params.quick_key){
              let data = JSON.parse( window.sessionStorage.getItem('searchUrl') || '[]')

              let temp =  data.find(item=>  item.quick_key == params.quick_key )
              if(temp!=undefined){
                alert('该快捷键已被占用,请重新提交一个快捷键!');
                return 
              }
            }
       
        console.log("add bookmark", params);

        if ($scope.add) {
            bookmarkService.addSearchUrl(params)
                .then((data) => {
                    $('.ui.modal.js-add-searchUrl').modal('hide');
                    if (data.title) {
                        toastr.success('[ ' + data.title + ' ] 添加成功，将自动重新更新搜索链接!' , "提示");
                    } else {
                        toastr.error('[ ' + params.title + ' ] 添加失败', "提示");
                    }
                    window.location.reload()
                })
                .catch((err) => {
                    console.log('addBookmark err', err);
                    toastr.error('[ ' + params.title + ' ] 添加失败' + JSON.stringify(err), "提示");
                });
        } else {
            bookmarkService.updateSearchUrl(params.id,params)
                .then((data) => {
                    $('.ui.modal.js-add-searchUrl').modal('hide');
                    toastr.success('[ ' + params.title + ' ] 更新成功，将自动重新更新搜索链接！', "提示");
                    window.location.reload()
                })
                .catch((err) => {
                    console.log('updateBookmark err', err);
                    toastr.error('[ ' + params.title + ' ] 更新失败' + JSON.stringify(err), "提示");
                });
        }
    }


    pubSubService.subscribe('bookmarksCtr.addSearchUrl', $scope, function(event) {
        console.log('subscribe bookmarksCtr.addSearchUrl');
        $('.ui.modal.js-add-searchUrl').modal({
            closable: false,
        }).modal('setting', 'transition', dataService.animation()).modal('show');
        setTimeout(function() {
            $('.ui.modal.js-add-searchUrl').modal("refresh");
        }, 500);
        $scope.add = true;
        cancelDefault = false;
              
                $scope.search_url = '';
                $scope.title = '';
                $scope.icon_class =  '';
                $scope.quick_key =  '';
                $scope.default = '0';
    
                $('.ui.checkbox.js-public').checkbox('set unchecked')

    });



    pubSubService.subscribe('bookmarksCtr.editSearchUrl', $scope, function(event, params) {
        console.log('subscribe bookmarksCtr.editSearchUrl', params);
        $('.ui.modal.js-add-searchUrl').modal({
            closable: false,
        }).modal('setting', 'transition', dataService.animation()).modal('show');
        setTimeout(function() {
            $('.ui.modal.js-add-searchUrl').modal("refresh");
        }, 500);
        $scope.add = false;
        cancelDefault = false;
                var bookmark = params.param;
             
                $scope.id = (bookmark && bookmark.id) || '';
                $scope.search_url = (bookmark && bookmark.search_url) || '';
                $scope.title = (bookmark && bookmark.title) || '';
                $scope.icon_class = (bookmark && bookmark.icon_class) || '';
                $scope.quick_key = (bookmark && bookmark.quick_key) || '';
                $scope.default = (bookmark && bookmark.default) || '';
    
                $('.ui.checkbox.js-public').checkbox((bookmark && bookmark.default && bookmark.default == '1') ? 'set checked' : 'set unchecked')

    });


    // 在输入文字的时候也会触发，所以不要用Ctrl,Shift之类的按键
    $document.bind("keydown", function(event) {
        $scope.$apply(function() {
            var menusScope = $('div[ng-controller="menuCtr"]').scope();
            var key = event.key.toUpperCase();
            // console.log(key);
            if (key == 'INSERT' && menusScope.login) {
                if ($('.ui.modal.js-add-bookmark').modal('is active')) {
                    $scope.ok();
                } else {
                    $('.ui.modal.js-add-bookmark').modal({
                        closable: false,
                    }).modal('setting', 'transition', dataService.animation()).modal('show');
                    $('.ui.checkbox.js-public').checkbox('set checked');
                    cancelDefault = true;
                    init();
                }
            }

            // Esc按键，退出
            if (key == 'ESCAPE' && menusScope.login) {
                $scope.cancel();
            }
        })
    });

    function init() {
        $scope.add = true;
        $scope.loadTags = true;
        $scope.autoGettitle = true;
        $scope.loadTitle = false;
        $scope.id = '';
        $scope.search_url = '';
        $scope.title = '';
        $scope.icon_class = '';
        $scope.quick_key = '';
        $scope.default = '0';

        $scope.searchUrlError = false;
        $scope.titleError = false;
        $scope.quickKeyError = false;
        $scope.iconClassError = false;
        $scope.defaultError = false;

    }
}]);
