// debug用に

//textファイルを5個作る
debugAddText = function (cb){
    var utime = new Date().getTime()
    var str = debugRandomStr()
    osRunOut("for i in 1 2 3 4 5; do echo 'dummytext_" + utime + str + "' > debug_" + utime + "_${i}.txt ; done; ls *.txt",'pane_debug_detail','replace',cb)

}
// txtファイルを　1/2の確率で 中身書き足し
debugEditText = function (cb){
    var str = debugRandomStr()
  osRunOut("ls *.txt | perl -lne 'print if rand(10) > 5;' | while read LINE; do echo '" + str + "'>>${LINE}; done ",'pane_debug_detail','replace',cb  )
}
// txtファイルを3割の確率で削除
debugDelText = function (cb){
  osRunOut("ls *.txt | perl -lne 'print if rand(10) > 7;' | xargs rm ",'pane_debug_detail','replace' ,cb )
}

//ランダム文字列を生成
debugRandomStr = function(){
  var ary = ['abcde','12345','akasatana','9999999','5555555','22222222aaaa99']
  return ary[ Math.floor(Math.random()*5.99)] +ary[ Math.floor(Math.random()*5.99)];

}

