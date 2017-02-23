
//初期処理
osRunOneLine('node -v', 'node_version')

// nodejs情報など  上の左
osRunCb('docker -v', function(ret_ary,stderr,command){
  $('#docker_ver_info').append(sRed(command) + '<br/>' + ret_ary.join('<br/>') + '<br/>')
})

osRunCb('docker-machine -v', function(ret_ary,stderr,command){
  $('#docker_ver_info').append(sRed(command) + '<br/>' + ret_ary.join('<br/>') + '<br/>')
})
osRunCb('docker-compose -v', function(ret_ary,stderr,command){
  $('#docker_ver_info').append(sRed(command) + '<br/>' + ret_ary.join('<br/>') + '<br/>')
})
osRunCb('docker info', function(ret_ary,stderr,command){
  $('#docker_info').append(sRed(command) + '<br/>' + ret_ary.join('<br/>') + '<br/>')
})

osRunCb('docker images', function(ret_ary,stderr,command){
  $('#docker_image_info').append(sRed(command) + '<br/>' + ret_ary.join('<br/>') + '<br/>')
})
osRunCb('docker ps', function(ret_ary,stderr,command){
  $('#docker_image_info').append(sRed(command) + '<br/>' + ret_ary.join('<br/>') + '<br/>')
})

osRunCb('docker --help', function(ret_ary,stderr,command){
  $('#docker_help_info').append(sRed(command) + '<pre>' + ret_ary.join('\n') + '</pre>')
})
osRunCb('docker-compose --help', function(ret_ary,stderr,command){
  $('#docker_help_compose_info').append(sRed(command) + '<pre>' + ret_ary.join('\n') + '</pre>')
})
osRunCb('docker-machine --help', function(ret_ary,stderr,command){
  $('#docker_help_machine_info').append(sRed(command) + '<pre>' + ret_ary.join('\n') + '</pre>')
})


osRunCb('node -v', function(ret_ary,stderr,command){
  $('#nodejs_info').append(sRed(command) + '<br/>' + ret_ary.join('<br/>') + '<br/>')
})

// osRunCb( 'npm -g list', function(ret_ary,stderr,command){
//   $('#nodejs_info').append(sRed(command) + '<br/>' + ret_ary.join('<br/>') + '<br/>')
// })

// ipc関連初期化
const {ipcRenderer} = require('electron')
toggleDevTools = function(){  ipcRenderer.send('ipcDevTool', 'ping')   }
toggleFullScreen = function(){  ipcRenderer.send('ipcFullScreen', 'ping')   }



//docker関連

findLocalDockerdir('cache')


//保存ファイル読み込み
if (!fs.existsSync('userdata')) fs.mkdir('userdata')

_G.his_repo = loadJson(_G.save_path　+ '/his_select_repo.txt')
if (!_G.his_repo) _G.his_repo = {}
showHisRepo()





document.onkeydown = function(e){
  //console.log('metakyu kyu : ',e.metaKey,e.key)

  if (e.metaKey && e.key == "1") {
      filterLocalRepos('')
      toggleTopPanes('local_repo_pane',"toggle")
  }
  if (e.metaKey && e.key == "2") {  // branches
    showBranchList('replace','list')
    toggleRepoDescPanes('local_branch','toggle')
  }
  if (e.metaKey && e.key == "3") {  // status
      makePaneStatus('replace')
      openPaneCenter('pane_status');
  }

  if (e.metaKey && e.key == "4") {  // files
      makePaneFilelist('');
      openPaneCenter('pane_filelist');
  }
  if (e.metaKey && e.key == "5") {  // commits
      makePaneLog('' , _G.log_lineOrTree)
  }
  if (e.metaKey && e.key == "6") {  // users
      makePaneUser('')
      openPaneCenter('pane_user')
  }
  if (e.metaKey && e.key == "7") {  // command
      openPaneCenter('pane_gitcommand')
      $('#git_usercommand').focus()
  }

  if (e.metaKey && e.key == "9") toggleFullScreen();
  if (e.metaKey && e.key == "d") toggleDevTools();

  //open edit
  if (e.metaKey && e.key == "e") {
      $('#repo_edit_pane').slideToggle(10)
      $('#btn_open_sublime3').focus()
  }
  if (e.metaKey && e.key == "o") {
      $('#repo_edit_pane').slideToggle(10);
      $('#btn_open_sublime3').focus()
  }
}



//enterなら候補1に確定、それ以外ならキー押すごとに検索
$('#filter_l_repo').keyup(function(e){
    if (e.which == 13 && top_filtered_repo) {
      setRepoPath( top_filtered_repo )
      return ;
    }
    filterLocalRepos($('#filter_l_repo').val())
})

$('#filter_filelist').keyup(function(e){
    if (e.which == 13) makePaneFilelist( $('#filter_filelist').val() )
})
$('#filter_log').keyup(function(e){
    if (e.which == 13) makePaneLog( $('#filter_log').val(), _G.log_lineOrTree )
})
$('#filter_user').keyup(function(e){
    if (e.which == 13) makePaneUser( $('#filter_user').val() )
})
