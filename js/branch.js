
makePaneUser = function(filter){
    var git_command = 'git log --pretty=format:"%an" | sort | uniq -c | sort -r '
    if (filter) git_command += " | egrep -i '" + filter + "'"
    osRunCb(git_command,
        function(ret_ary){
            out_str = sRed(git_command) + " " + ret_ary.length + '<br/>'
            out_str += "<table>"
            for (var ind in ret_ary) {

                var line = ret_ary[ind].trim()
                var line_ary = line.match(/(\d+ )(.*$)/)

                // top ranker = big font
                class_str =""
                if (ind <= 20) class_str = 'class="s120"'
                if (ind <= 10) class_str = 'class="s150"'

                out_str += '<tr><td ' + class_str + '>' + sSilver((parseInt(ind) + 1 )) + '</td>' +
                              '<td ' + class_str + '><span onClick="makePaneLog(\'' + line_ary[2] + '\',\'line\')" class="btn">' + matchRed(line_ary[2],filter) + '</span></td>' +
                              '<td ' + class_str + '>' + line_ary[1] + '</td></tr>'
            }
            out_str += '<table>'
            
            $('#pane_user_detail').html(out_str)
            openPaneCenter('pane_user');
            $('#filter_user').focus()
        }
    )
}


makePaneFilelist = function(filter,base_command){

    $('#pane_filelist_detail').html('')
    $('#pane_filelist_detail_r').html('')

    $('#filter_filelist').val(filter)

    //ファイル検索
    var git_command = 'git ls-files '
    console.log('base_command**',base_command)
    if (base_command != undefined && base_command) git_command = base_command

    filter_ary = filter.trim().split(/\s+/)
    for (var ind in filter_ary){
       git_command += " | egrep -i '" + escapeRegExp(filter_ary[ind]) + "'"
    }
    git_command += ' | head -300'
    osRunCb(git_command,
      function( ret_ary){

          $('#pane_filelist_detail_r').append(sRed(escapeHTML(git_command)) + " " + sGray(ret_ary.length) + '<br/>')
          var str_out =""
          for (var ind in ret_ary){
            for (var ind2 in filter_ary){
              ret_ary[ind] = '<a onClick="makePaneFileStat(\'' + ret_ary[ind].trim() + '\')" href="javascript:void(0);" >' + matchRed(ret_ary[ind],filter_ary[ind2]) + '</a><br/>'
            }
            str_out += ret_ary[ind]
          }
          $('#pane_filelist_detail_r').append(str_out )

          openPaneCenter('pane_filelist');
          $('#filter_filelist').focus()
    })

    //スラッシュのないもの

    //拡張子でまとめ
    var comExt = "git ls-files | egrep -i '\\.' | perl -ple 's/(.*)(\\..*)/$2/' | sort | uniq -c | sort -r | head -20"
    console.log('extension ' , comExt)
    osRunCb(comExt,
      function( ret_ary){
          console.log('str_out1',ret_ary)
          var str_out_ext =""
          for (var ind in ret_ary){
              var ary = ret_ary[ind].trim().split(/\s+/)
              str_out_ext += '<a onClick="makePaneFilelist(\'' +  ary[1] + '\')" href="javascript:void(0);" >' + matchRed(ary[1],filter) + '</a>' + ary[0] + ' &nbsp; '
          }
          str_out_ext +="</table>"
          $('#pane_filelist_ext').html(str_out_ext)

          //writeLeftPane()
      }
    )

    //dir 1階層でまとめ
    var com1 = "git ls-files | egrep -i '\/' | perl -ple 's/(.*?\\/)(.*)/$1/' | sort | uniq -c | head -100"
    console.log(com1)
    var str_out1 = ""
    var str_out2 = ""
    var writeLeftPane = function(){
        if (str_out1 && str_out2) $('#pane_filelist_detail').append(str_out1 + str_out2 )
    }

    osRunCb(com1,
      function( ret_ary){
          console.log('str_out1',ret_ary)
          str_out1 ="<table>"
          for (var ind in ret_ary){
              var ary = ret_ary[ind].split(/\s+/)
              str_out1 += '<tr><td> <a onClick="makePaneFileStat(\'' + ary[1].trim() + '\')" href="javascript:void(0);" >' + matchRed(ary[1],filter) + '</a> </td><td> ' + ary[0] + ' </td></tr>'
          }
          str_out1 +="</table>"
          writeLeftPane()
      }
    )

    //dir 2階層でまとめ
    var com2 = "git ls-files | egrep -i '\\/.*\\/' | perl -ple 's/(.*?\\/.*?\\/)(.*)/$1/' | sort | uniq -c"
    osRunCb(com2,
      function( ret_ary){
        str_out2 = "<table>"
        for (var ind in ret_ary){
            var ary = ret_ary[ind].split(/\s+/)
            str_out2 += '<tr><td> <a onClick="makePaneFileStat(\'' + ary[1].trim() + '\')" href="javascript:void(0);" >' + matchRed(ary[1],filter) + '</a> </td><td> ' + ary[0] + ' </td></tr>'
        }
        str_out2 +="</table>"
        writeLeftPane()
      }
    )
}

makePaneFileStat = function(filepath){

  $('#pane_file_detail_1').html("")
  $('#pane_file_detail_2').html("")

  //最新と最後の日付
  var com2 = 'git log --oneline --follow --date=short --pretty=format:"%ad%x09%an" '  + filepath.trim()
  osRunCb(com2,
    function(ret_ary){

      $('#pane_file_desc').html( s120(ret_ary.length) + sGray("commits ") + s120(ret_ary[ ret_ary.length -1 ]) + ' - ' + s120(ret_ary[ 0 ]) + '<hr/>')

      var names = []
      for (var ind in ret_ary){
          var name = ret_ary[ind].split(/\t/)[1].trim()
          if (!names[name]) names[name] =1
          else names[name]++
      }
      var str ="<table>"
      for (var ind in names){
          str += '<tr><td>' + ind + "</td><td>" +names[ind] + '</td></tr>'
      }
      str +="</table>"
      $('#pane_file_desc').append(str + '<br/>')


  })

  //ファイル変更
  var git_command = 'git log --oneline --follow --name-status --date=short --pretty=format:" %ad %h  %an %s " '  + filepath.trim()
  osRunCb(git_command,
    function(ret_ary){

      var full_path = path2dir(_G.current_repo_path) + "/" + filepath
      var stat = fs.statSync( full_path )

      var ntype = "File"
      if (stat.isDirectory()) ntype = "Dir "

      $('#pane_file_filename').html( s150( sBold( sBlue(ntype) + " " + filepath)))
      htmlstr = sRed(escapeHTML(git_command)) + " " + sGray(ret_ary.length) + '<br/>'
      $('#pane_file_detail_1').append( htmlstr + ret_ary.join('<br/>') + '<br/><br/>')
  })

  //diff
  var git_command2 = 'git log -p --oneline --pretty=format:" %ad %x09 %h %x09 %an %x09 %s" '  + filepath.trim()
  osRunCb(git_command2,
    function(ret_ary){
      var htmlstr = s150(sBold('diff')) + '<hr/>' +
                   sRed(escapeHTML(git_command2)) + " " + sGray(ret_ary.length) + '<br/>'
      for (var ind in ret_ary){
        ret_ary[ind] = replaceTabSpc(escapeHTML(ret_ary[ind]))
      //  str_out += '<a onClick="makePaneFileStat(\'' + ret_ary[ind].trim() + '\')" href="javascript:void(0);" >' + ret_ary[ind].replace(new RegExp('(' + filter.trim() + ')','ig'),sRed('$1') ) + '</a><br/>'
      }
      ret_ary = diffColor(ret_ary)

      var str_out2 = ret_ary.join('<br/>')
      $('#pane_file_detail_2').append( htmlstr + str_out2 )

      openPaneCenter('pane_file');
  })
}

makePaneDiff = function( diff_command ){

    $('#pane_gitdiff_detail').html('')
    var com1 = 'git diff --stat ' + diff_command 
    osRunCb( com1,
      function(ret_ary){

        var ret_out_str = ret_ary.join('\n')
       ret_out_str = ret_out_str.replace(/(-+)/gm,sBlueRev('$1')).replace(/(\++)/gm,sGreenRev('$1'))

       $('#pane_gitdiff_detail').append(
            '<br/>' + sRed(escapeHTML(com1)) + " " + sGray(ret_ary.length) + '<br/>' + 
            '<pre class="detail code" >' + ret_out_str + '</pre>' )


        var com2 ='git diff ' + diff_command
        osRunCb( com2,
            function(ret_ary2){
               ret_ary2 = diffColor(ret_ary2)
               var ret_out_str = ret_ary2.join('\n')

               $('#pane_gitdiff_detail').append(
                    '<br/>' + sRed(escapeHTML(com2)) + " " + sGray(ret_ary2.length) + '<br/>' + 
                    '<pre class="detail code" >' + ret_out_str + '</pre>' )
         })

      })
}

makePaneLog = function( filter, lineOrTree ){

   if (!lineOrTree.match(/(line|tree)/)) alert('makePaneLog logOrTree:' + lineOrTree)

    var tree = ""
    if (lineOrTree == 'tree') tree = ' --graph '

    var git_command = 'git log ' + tree + _G.log_all + ' --date=relative --pretty=format:"%x09 %ad %x09 %h %x09 %an %x09 %s %x09 %D"'


    $('#filter_log').val(filter) // 引数で来たフィルターもテキストボックスにセット
     filter_ary = filter.trim().split(/\s+/)
     for (var ind in filter_ary){
        git_command += " | egrep -i '" + filter_ary[ind] + "'"
     }
     git_command += ' | head -300'

     osRunCb(git_command,
       function(ret_ary){
          $('#pane_log_detail').html('')
          $('#pane_log_detail').append(sRed(escapeHTML(git_command)) + " " + sGray(ret_ary.length) + '<br/>')

  //        if (lineOrTree == 'line') {
             for (var ind in ret_ary){
                 var line_ary = ret_ary[ind].split(/\t/)
                 if (line_ary.length==6){
                    line_ary[2] = '<span onClick="makePaneDiff(\'' + line_ary[2].trim() + '^..' + line_ary[2].trim() + '\'); openPaneCenter(\'pane_gitdiff\');" class="btn">' + line_ary[2].trim() + '</span>'
                 }else{
                    line_ary.push(sSilver('-'))
                    line_ary.push(sSilver('-'))
                    line_ary.push(sSilver('-'))
                    line_ary.push(sSilver('-'))
                    line_ary.push(sSilver('-'))
                 }
                 ret_ary[ind] = '<tr><td nowrap>' + line_ary.join('</td><td nowrap >')　+ '</td></tr>'
             }
             var str_out = ret_ary.join('\n')
             for (var ind in filter_ary){
                if (!filter_ary[ind]) continue;
                str_out = str_out.replace(new RegExp('(' + filter_ary[ind].trim() + ')','ig'),sRed('$1') )
             }
             $('#pane_log_detail').append('<pre class="detail code"><table>' + str_out + '</table></pre>')



          // tree
          // }else{
          //    var str_out = ret_ary.join('\n')
          //    for (var ind in filter_ary){
          //       if (!filter_ary[ind]) continue;
          //       str_out = str_out.replace(new RegExp('(' + filter_ary[ind].trim() + ')','ig'),sRed('$1') )
          //    }
          //    $('#pane_log_detail').append('<pre class="code">' + str_out + '</pre>')

          //  }

          openPaneCenter('pane_log');
          $('#filter_log').focus()
     })
}


