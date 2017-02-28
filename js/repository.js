
// dockerfileのあるフォルダを探す is_refresh 強制再読み込みフラグ キャッシュつき
findLocalDockerdir = function(is_refresh){ // search

  if (is_refresh == undefined || !is_refresh.match(/(refresh|cache)/)) alert('findLocalRepos isRefresh:' + is_refresh);

  //保存ファイルがなければ取得
  var file_fullpath = _G.save_path　+ '/local_repos.txt'
  console.log('is_refresh',is_refresh)
  _G.local_repos = loadJson(file_fullpath)

  if (_G.local_repos && is_refresh == 'cache' ){
    console.log('get from file local repos ',file_fullpath,_G.local_repos)
    $('#docker_dir_count').html(_G.local_repos.length)
    toggleTopPanes('local_repo_pane',"down")
    filterDockerFiles('')
  }else{

    console.log('find')
    $('#docker_dir_count').html("");
    _G.local_repos = [];

    osRunCb("find ~ -type f -maxdepth 5 | egrep -i '/Dockerfile$' ",
      function( ret_ary ){
          console.log(ret_ary.join(','));
          _G.local_repos = _G.local_repos.concat(ret_ary)
          $('#docker_dir_count').append(_G.local_repos.length)
          saveJson(file_fullpath,_G.local_repos)
          toggleTopPanes('local_repo_pane',"down")
          filterDockerFiles('')
      })

    osRunCb("find ~ -type f -maxdepth 5 | egrep -i '/docker-compose.*?.yml$' ",
      function( ret_ary ){
          console.log(ret_ary.join(','));
          _G.local_repos = _G.local_repos.concat(ret_ary)
          $('#docker_dir_count').append(_G.local_repos.length)
          saveJson(file_fullpath,_G.local_repos)
          toggleTopPanes('local_repo_pane',"down")
          filterDockerFiles('')
      })
  }
}

showCommandLog = function(){
    $('#command_log').html( _G.commandlog.join('<br/>') );
}


// fuc名直す top pane郡のトグル
toggleTopPanes = function (key,action){  //action == up down toggle

  if (!action.match(/up|down|toggle/)) alert('toggleTopPanes action invalid' + action)

  if (action == "toggle" ){
    action = "down"
    if ($('#' + key).css('display') == 'block' ) action = "up"
  }
  $('div[pane=top]').slideUp(10)

  if (action == "up" ){
      $('#' + key).slideUp(10)
  }else{

      $('#' + key).slideDown(10)
      $('#filter_l_repo').val('')
      filterDockerFiles('')
      $('#filter_l_repo').focus()
  }
}

//個別のペーンを出す方式に
tglRepoPane = function (key,action){

  if (!action.match(/up|down|toggle/)) alert('tglRepoPane action invalid' + action)

  if (action == "toggle" ){
    action = "down"
    if ($('#' + key).css('display') == 'block' ) action = "up"
  }
  $('div[pane=repo]').slideUp(10)

  //開いてる項目を押したら閉じる
  if (action == "up" ) $('#' + key).slideUp(10)
  else                 $('#' + key).slideDown(10)

  repo_prev_push=key
}

togglePaneStatus = function(key,action){

  if (!action.match(/up|down|toggle/)) alert('togglePaneStatus action invalid' + action)

  if (action == "toggle" ){
    action = "down"
    if ($('#' + key).css('display') == 'block' ) action = "up"
  }
  $('div[pane=status]').slideUp(10)

  //開いてる項目を押したら閉じる
  if (action == "up" ) $('#' + key).slideUp(10)
  else                 $('#' + key).slideDown(10)

}


openPaneCenter = function( pane_name ){
  $('div[pane=center]').hide()
  $('#' + pane_name).slideDown(10)
}


setCurrentBranchName = function(){
    osRunCb('git branch',function(ret_ary){
        for (var ind in ret_ary){
            if (ret_ary[ind].match(/\*/)){
                $('#c_branch').html(ret_ary[ind].replace("*","").trim())
            }
        }
    })
}


//dockerfileと docker-compose.yml関連の一覧を表示
filterDockerFiles = function (filter){

  $('#local_repo_list').html("<table>");
  top_filtered_repo =""
  for (var ind in _G.local_repos){
      var full_path = _G.local_repos[ind]
      fname = path2pjname(full_path)
      fname_disp = fname

      if (filter) {
          var re = new RegExp('('+filter+')','i')
          if (!fname.match(re)) continue;

          if (!top_filtered_repo) top_filtered_repo = full_path
          fname_disp = fname_disp.replace(re,sRed('$1'))

          console.log('enterでセット' ,top_filtered_repo)
      }

      var fullpath_disp = sGray(full_path.replace(fname,sGray2(fname)).replace('.Trash',sCrimson('.Trash')))

      $('#local_repo_list').append('<tr><td> <a href="javascript:void(0)" onClick="setMainRepo(\'' + full_path + '\')" class="btn s150">' +
                                fname_disp + '</span> </td><td> ' +
                                ' &nbsp; ' + fullpath_disp + '</td><td>' +
                                '</td></tr>')
  }
  $('#local_repo_list').append("</table>");
}

showHisRepo = function(){

  $('#his_repo').html("")
  for (var name in _G.his_repo){
    $('#his_repo').append('<span onClick="setMainRepo(\'' + name + '\');" class="history s80">' + path2pjname(name) + '</span> ');
  }

}


//main_repo_name  submodules_list
setMainRepo = function(full_path){
    console.log("local_repo");

    $('#main_repo_name').html( '<span onClick="setRepoPath(\'' + full_path + '\')">' + path2pjname(full_path) + '</span>' )


    console.log('setMainRepo ' + full_path)
    //履歴
    _G.his_repo[full_path] = "";
    saveJson(_G.save_path　+ '/his_select_repo.txt' , _G.his_repo)
    showHisRepo()

    setRepoPath(full_path)

}

// set local repository
setRepoPath = function(full_path) {
    console.log(full_path)

    
     osRunCb('cat ' + full_path,
      function(ret_ary,stderr,com){
          $('#dockerfile_cat').html(ret_ary.join('<br/>'))
      })

    //現在dirセット
    _G.current_repo_path = full_path
    execOption.cwd = path2dir(_G.current_repo_path)

    $('#current_repo_name').html( path2pjname(full_path) )
    $('#current_repo_path').html( full_path )
    $('#local_repo_pane').slideUp(10)

    //repository
    
    //branch
    setCurrentBranchName()
    tglRepoPane("local_branch",'up') // close
    //makePaneStatus('replace')

    osRunOneLine("du -d0 -h | perl -pne 's/(\\t.*)//' " , 'current_repo_size') //ディスク使用量 タブ以降の . を削除

    //ブランチの初期画面はlog
    makePaneLog('','line')

    $('#repo_info').show() // 初回のrepo選択時は隠しているので
    $('#branch_info').show() // 初回のrepo選択時は隠しているので
}
