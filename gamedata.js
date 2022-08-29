//<!-- <canvas id="myCanvas" width="320" height="240"></canvas> -->
    //document.writeの代わり
    function id_write(id,val){
        document.getElementById(id).innerHTML+=(val);
    };

    function body_write(val){
        document.body.innerHTML+=val;
    };

    //変数をもとにタイルをチェック(関数定義)
    function chk(x,y,tile,mode){
        //modeが0なら名前の一部にtileの値が入っていれば含む
        //modeを1にするとtileと全く同じ名前のタイルしか含まなくなる
        var chktile = document.getElementById(`map${x}_${y}`);
        var a = tile;
        //modeが1なら名前の前後に記号を付ける
        if(mode==1)a="/"+tile+".";
        //チェック位置がマップをはみ出す場合は見つからなかったことにする
        if(y>=mapy || x>=mapx){return -1};
        if(y<0 || x<0){return -1};
        return chktile.innerHTML.indexOf(a);
    };
    
    //着地したかチェック(関数定義)
    function chkground(x,y,fall){
        var j
        //チェック先が壁・はしごまたはマップ外なら着地(1を返す)
        if(chk(x,y+fall,"ladder",0)>=0 || chk(x,y+fall,"wall.",0)>=0 || y+fall>=mapy){return 1};
        //チェック先が箱だった場合
        if(chk(x,y+fall,"box",1)>=0){
            j=y+fall;
            //箱以外が見つかるまで下に進む
            while(1){
                j++;
                if( chk(x,j,"box",1)<0 || j>=mapy ){break};
            }
            //見つかったものが壁か梯子なら着地(1を返す)
            if(chk(x,j,"wall.",0)>=0){return 1}
            if(chk(x,j,"ladder",0)>=0){return 1}
            if(j>=mapy){return 1}
        }
        //着地せずにここまでたどり着いたら0を返す
        return 0;
    }
    //キャラを動かす・箱を押す(関数定義)
    //push=この移動で箱を押せるかどうか(落下による移動で箱は押せないようにするため)
    //dicx,dicy=移動方向
    function move(push,dicx,dicy){
        var chktile,i,breaked=0;
        var nx,ny;
        //移動先がマップをはみ出していたら止まる(元の位置に戻る)
        if(px>=mapx || py>=mapy){px=pxp;py=pyp}
        else if(px<0 || py<0){px=pxp;py=pyp}
        //はみ出していないなら移動開始
        else{
            //移動先のタイルを確認できるようにする
            chktile = document.getElementById(`map${px}_${py}`);
            //壁に当たっていたら止まる(元の位置に戻る)
            if(chk(px,py,"wall",0)>=0 || map[py].charAt(px)=="￣"){px=pxp;py=pyp}
            //箱に当たったらその先に何があるか見る
            else if(chk(px,py,"box.",0)>=0){
                i=0;
                //箱じゃないものが見つかるまで進行方向へ進みながらタイルを確認
                nx=px+dicx*i;
                ny=py+dicy*i;
                while(chk(nx,ny,"box.",0)>=0){
                    i++;
                    //検索先がマップからはみ出すなら打ち切り
                    if(px+dicx*i>=mapx || py+dicy*i>=mapy){breaked=1;break};
                    if(px+dicx*i<0 || py+dicy*i<0){breaked=1;break};
                    //押す予定ではない場合(落下中)打ち切り
                    if(!push){breaked=1;break};
                    //次のタイルを確認できるようにする
                    nx=px+dicx*i
                    ny=py+dicy*i
                    chktile = document.getElementById(`map${nx}_${ny}`);
                }
                //壁なら止まる(元の位置に戻る)
                if(chk(nx,ny,"wall.",0)>=0){px=pxp;py=pyp}
                //打ち切られた(マップからはみだした)なら止まる(元の位置に戻る)
                else if(breaked==1){px=pxp;py=pyp}
                //どちらでもないなら押す
                else {
                    while(i!=0){
                        nx=px+dicx*i;
                        ny=py+dicy*i;
                        chktile = document.getElementById(`map${nx}_${ny}`);

                        //押した結果設置場所に行ったらチェックをつける
                        if (chk(nx,ny,"put",0)>=0 && chkground(nx,ny,1)){
                            chktile.innerHTML='<img src="image/boxwall.png">';
                            putleft--
                        //そうでないならそのまま押す
                        } else {
                            chktile.innerHTML='<img src="image/box.png">';
                        }
                        i--;
                        nx=px+dicx*i;
                        ny=py+dicy*i;
                        chktile = document.getElementById(`map${nx}_${ny}`);
                        
                        //console.log(obj[ map[py+dicy*i].charAt(px+dicx*i) ])
                        //もともと箱があった場所にその場に元あったタイルを貼る
                        if(map[ny].charAt(nx)=="箱"){
                            chktile.innerHTML='<img src="image/floor.png">'
                        } else {
                            chktile.innerHTML=`<img src="image/${obj[ map[ny].charAt(nx) ]}.png">`
                        }
                    };
                };
            };
            
            //タイムをカウントし始めていない(タイムが-1)場合、タイムを0からスタート
            if(time<0 && push)time=0;
        };
    }


    //プレイヤー・木箱の落下処理・常に行う処理(関数定義)
    function fall(){
        //画面の位置確認
        scrx=getscreen(0);
        scry=71;
        //残りの設置場所の数が1を下回るとクリアの処理へ
        if(putleft<1)clear=1;
        //プレイヤーの見た目をを現在地に強制的に移動
        player.style.top=scry + py * 32 + "px";
        player.style.left=scrx + px * 32 + "px";
        console.log(player.style.left)
        //プレイヤーの落下
        if(py!=mapy-1){//もしもプレイヤーが一番下にいなかったら
            //はしごに掴まっていなかったら/乗っていなかったら下に落ちる
            if(Math.max( chk(px,py,"ladder",1) , chk(px,py+1,"ladder",1) )<0)down(1);
        };
        pxp=px;pyp=py;
        //クリア時の処理
        if(clear==1){
            //プレイヤーキャラをクリアした時のポーズにする
            document.getElementById(`player`).src="image/manclear.png";
            //スコアボードの中身書き換え(クリア済みの場合)
            document.score.Pleft.value="ｸﾘｱ";
            if(time==-1){document.score.timer.value="全ステージｸﾘｱ"}
            else if(time==-2){document.score.timer.value="動かずクリア"}
            else {document.score.timer.value=time/10};
        //プレイ中の処理
        }else{
            var i,j,chktile,chktile2,chktile3;
            var chkbox=0;
            //木箱の落下・タイルの切り替え
            for(j=mapy-2;j>=0;j--){
                for(i=0;i<mapx;i++){
                    chkbox=0//チェックした位置にボックスがあれば1が入る
                    chktile = document.getElementById(`map${i}_${j}`);
                    chktile2 = document.getElementById(`map${i}_${j+1}`);

                    //チェックした位置にボックスがあるならchkboxに1を入れる
                    //if(Math.max( chk(i,j,"box",1) , chk(i,j,"boxwall",1) )>=0){chkbox="box"};
                    if(chk(i,j,"box",1)>=0){chkbox=1};
                    //真下にプレイヤーがいるならchkboxを0に
                    if(px==i && py==j+1){chkbox=0};
                    
                    
                    //chkboxに値が入っているなら
                    if(chkbox!=0){ 
                        //下が空間、設置場所、すり抜け床なら一つ下に箱をいれ、元あった場所に元のタイルを入れる
                        if(chk(i,j+1,"floor",0)>=0 || chk(i,j+1,"wall_thought",1)>=0){
                            if(chk(i,j,"boxwall",1)>=0){putleft++};

                            //元のタイルが箱なら代わりに空間を入れる
                            if(map[j].charAt(i)=="箱"){
                                chktile.innerHTML='<img src="image/floor.png">';
                            } else {
                                chktile.innerHTML=`<img src="image/${obj[ map[j].charAt(i) ]}.png">`;
                            }
                            //一つ下が設置場所で、着地できそうなら、設置済みの箱にする
                            if(chk(i,j+1,"floorput",1)>=0 && chkground(i,j,2) ){
                                chktile2.innerHTML='<img src="image/boxwall.png">';
                                putleft--;
                            //そうでなければ普通の箱
                            } else {
                                chktile2.innerHTML='<img src="image/box.png">';
                            }
                            if(time==-1)time=-2;
                        }
                        //もし着地して設置場所に重なっている普通の箱があれば設置済みにする
                        else if(chk(i,j,"box",1)>=0 && obj[map[j].charAt(i)]=="floorput" && chkground(i,j,1)){
                            chktile.innerHTML='<img src="image/boxwall.png">';
                            putleft--;
                        }
                        
                    };
                    //もし着地していない設置済みの箱があれば普通の箱にする
                    if(chk(i,j,"boxwall",1)>=0 && !chkground(i,j,1)){
                        chktile.innerHTML='<img src="image/box.png">';
                        putleft++;
                    }
                    //レバー・赤青ブロックのグラフィッグを更新する
                    chktile3=map[j].charAt(i);
                    if((chktile3=="／" || chktile3=="赤" || chktile3=="青") && chk(i,j,"box",0)<0){
                        chktile.innerHTML=`<img src="image/${obj[ map[j].charAt(i) ]}.png">`;
                    };
                };
            };
            //pxp2とpyp2に現在の座標を記録しておく
            pxp2=px
            pyp2=py

            //キャラの操作(上下)
            if(KEYup+KEYdown!=2){//同時押ししていたら動かないようにする
                if(KEYup==1)up();
                if(KEYdown==1)down(0);
            }
            //キャラの操作(左右)
            if(KEYleft+KEYright!=2){//同時押ししていたら動かないようにする
                if(KEYright==1)right();
                if(KEYleft==1)left();
            }
            
            //チョン押し(キーを押した後、タイマーが変わる前に離した)されていたならキーを離していても動く
            if(upmove==1){
                if(KEYup+KEYdown!=-2){//同時押ししていたら動かないようにする
                    if(KEYup==-1)up();
                    if(KEYdown==-1)down(0);
                }
                if(KEYleft+KEYright!=-2){//同時押ししていたら動かないようにする
                    if(KEYright==-1)right();
                    if(KEYleft==-1)left();
                }
                upmove=0

            }
            //移動先にスイッチがあるなら入れ替え
            if(map[py].charAt(px)=="／" &&(pxp2-px!=0 || pyp2-py!=0)){
                //赤から青へ
                if(obj["／"]=="switchred"){
                    obj["／"]="switchblue";
                    obj["赤"]="redfloor";
                    obj["青"]="bluewall";
                //青から赤へ
                } else if(obj["／"]=="switchblue"){
                    obj["／"]="switchred";
                    obj["赤"]="redwall";
                    obj["青"]="bluefloor";
                }
            }
            //キャラのグラフィッグを切り替え
            if(chk(px,py,"ladder",1)>=0 && (chk(px,py+1,"wall",0)<0 && chk(px,py+1,"box",0)<0)){
                if(Gnum!=3){player.src="image/man_ladder.gif";Gnum=3};//はしごにつかまっている
            } else {
                
                if(px>pxp2 && Gnum!=1){player.src="image/man_walkR.gif";Gnum=1};//右向き
                if(px<pxp2 && Gnum!=2){player.src="image/man_walkL.gif";Gnum=2};//左向き
                if(Gnum==3){player.src="image/man.gif";Gnum=0};//はしごから降りた
            }
            
            //-1になっていたキーの変数を0に戻す
            if(KEYup==-1)KEYup=0;
            if(KEYright==-1)KEYright=0;
            if(KEYdown==-1)KEYdown=0;
            if(KEYleft==-1)KEYleft=0;

            //タイム加算
            if(time>=0)time++;
            
            //スコアボードの中身書き換え
            document.score.Pleft.value=putleft;
            if(time<0){document.score.timer.value="動くと計測開始"}
            else {document.score.timer.value=time/10};


            
        }

        //プレイヤーの見た目をを現在地に向けてアニメーションさせる
        //もし記録した座標にはしごにあってx座標のみ現在の位置にずらした座標に壁があれば移動のアニメーションを変える
        // if( chk(pxp2,pyp2,"ladder",0)>=0 && chk(px,pyp2,"wall",0)>=0 ){
        //     $(player).animate({left:scrx + pxp2 * 32 + "px",top: scry + py * 32 + "px"}, gamespeed/2, 'linear');
        //     $(player).stop().animate({left:scrx + px * 32 + "px",top: scry + py * 32 + "px"}, gamespeed/2, 'linear');
        // //もしそうでなければ普通に移動する
        // } else {
            $(player).stop().animate({left:scrx + px * 32 + "px",top: scry + py * 32 + "px"}, gamespeed, 'linear');
        // }

        




        //タイマーイベントで繰り返す
        timer = setTimeout("fall()",gamespeed);
    };
    //プレイヤーの移動(関数定義)
    function Pmove(needL,dicx,dicy,fall){
        if(chk(px,py,"ladder",1)>=0 || !needL){
            pxp=px;pyp=py;
            if(dicx!=0)px+=dicx;
            if(dicy!=0)py+=dicy;
            move(!fall,dicx,dicy);
        }
    }
    //画面の位置を取得(関数定義)
    function getscreen(mode){
        var map = window.getComputedStyle(document.getElementById('map'));
        var result
        
        result=map.getPropertyValue('margin-left');
        return Number( result.slice(0,result.length-2) );
    }
    //プレイヤー操作用のオブジェクト生成
    function controle(){}
    controle.prototype.move=Pmove



    //移動(関数定義)
    function up(){PlCon.move(true,0,-1,false)};

    function right(){PlCon.move(false,1,0,false)};

    function down(fall){PlCon.move(false,0,1,fall)};

    function left(){PlCon.move(false,-1,0,false)};

    //一番最初の処理(関数定義)
    function begin(){
        Vreset()//値のリセット
        //スコアボード表示(カスタムステージではすでに出てるので出さない)
        body_write('<form name="score" id="score">');

        //操作方法の表示
        if(stagenum!=-1)id_write("score",'<p>方向キーで移動/Rでやり直し/クリア後Nで次のステージ</p>');
        if(stagenum==-1)id_write("score",'<p>方向キーで移動/Rでやり直し/Nでエディタに戻る</p>');//カスタムステージの場合
        //残りの設置場所とタイム表示
        id_write("score",`<p>残りの設置場所：<input type="text" name="Pleft" id="Pleft"> タイム：<input type="text" name="timer" id="timer"></p>`);
        body_write('</form>');

        //プレイヤーキャラの表示
        body_write('<img src="image/man.gif" id="player" >');

        
        //マップの表示
        body_write(`<table id="map">`);
        mapx=map[0].length//マップの一番上の文字列の長さをマップの横幅に
        mapy=map.length//マップの配列の数をマップの縦幅に

        //テーブルの作成
        for(j=0;j<mapy;j++){
            id_write("map",`<tr id="tr${j}">`);
            for(i=0;i<mapx;i++){
                id_write(`tr${j}`, `<td id="map${i}_${j}">`)
                //マップチップに対応した画像を設置していく
                id_write(`map${i}_${j}`, `<img src="image/${obj[ map[j].charAt(i) ]}.png">`)
                //マップチップによっては特殊な処理をする
                if(map[j].charAt(i)=="人"){px=i;py=j;pxp=i;pyp=j};
                if(map[j].charAt(i)=="✕"){putleft++};
                if(map[j].charAt(i)=="×"){putleft++};
                id_write(`tr${j}`, "</td>")
            }
            id_write("map", "</tr>");
        }
        body_write("</table>");

        
        player = document.getElementById("player");
        player.src="image/man.gif"//キャラクターの見た目設定
        //move()
        playing = true
        console.log("begin")
        //タイマーイベントの設定
        timer = setTimeout("fall()",gamespeed)
    }
    //値のリセット(関数定義)
    function Vreset(){
        putleft=0
        clear=0
        time=-1
        KEYup=0
        KEYright=0
        KEYdown=0
        KEYleft=0
        Gnum=0
        obj["／"]="switchred";
        obj["赤"]="redwall";
        obj["青"]="bluefloor"
    }
    //ここで関数定義終わり--------------------------------------------------------------
    var gamespeed = 100;//ゲームスピード
    var PlCon= new controle;//プレイヤー操作用インスタンス生成
    var stagenum = 0;//ステージ番号
    var i , j , timer, putleft=0;//for文用変数・タイマーイベント用変数・残り設置場所数カウント変数
    var player;//プレイヤー表示用の画像のIDの指定
    var px,py,clear=0,time=-1;//プレイヤー位置・クリア判定・タイマー
    var pxp,pyp,dicx,dicy;//移動用変数
    var pxp2,pyp2;//アニメーション用変数
    var scrx,scry;//画面の位置代入用変数
    var timep , upmove=0;//チョン押しで動くようにするための処理に使う変数
    var obj = new Object;//マップチップと画像名を結びつける連想配列
    var Gnum = 0;//グラフィッグの番号
    var playing = false;//プレイ中かどうか
    var mapx , mapy;//マップサイズ
    obj["　"]="floor";
    obj["・"]="floor";
    obj["人"]="floor";
    obj["壁"]="wall";
    obj["￣"]="wall_thought";
    obj["✕"]="floorput";
    obj["×"]="floorput";
    obj["箱"]="box";
    obj["Ｈ"]="ladder";
    obj["／"]="switchred";
    obj["赤"]="redwall";
    obj["青"]="bluefloor";
    //ファビコンの設定
    document.head.innerHTML+=`<link rel="icon" href="image/favicon.ico">`

    
    //ページ名からステージ番号をとる
    for(i=location.href.indexOf( "game0/stage", 0 )+11;location.href.charAt(i)!=".";i++){
        if(location.href.charAt(i)=="c"){stagenum=-1;break};//カスタムステージならステージ番号を-1にする
        stagenum*=10;
        stagenum+=Number(location.href.charAt(i));
    }
    console.log(stagenum)
    
    if(stagenum!=-1)begin()

    //キーボード操作の監視
    
    var KEYup=0 ,KEYright=0,KEYdown=0,KEYleft=0;
    document.addEventListener(`keydown`, function() {
        //プレイ中の処理
        if(playing){
            //上下左右(方向キーが押されたら各変数を1にする)
            if(event.key=="ArrowUp" && clear==0)KEYup=1;
            if(event.key=="ArrowRight" && clear==0)KEYright=1;
            if(event.key=="ArrowDown" && clear==0) KEYdown=1;
            if(event.key=="ArrowLeft" && clear==0) KEYleft=1;
            //R(押すとステージをやり直す)
            if(event.key=="r"){
                
                Vreset()//値のリセット
                //プレイヤーキャラのポーズを元に戻す
                document.getElementById(`player`).src="image/man.gif";
                //マップを元に戻す
                for(j=0;j<mapy;j++){
                    for(i=0;i<mapx;i++){
                        document.getElementById(`map${i}_${j}`).innerHTML=`<img src="image/${obj[ map[j].charAt(i) ]}.png">`
                        if(map[j].charAt(i)=="人"){px=i;py=j;pxp=i;pyp=j};
                        if(map[j].charAt(i)=="✕"){putleft++};
                        if(map[j].charAt(i)=="×"){putleft++};
                    }
                }
            }
            //N(クリア後に押すと次のステージに進む/カスタムステージではエディタに戻る)
            if(event.key=="n"){
                //通常ステージでの処理
                if(clear==1 && stagenum>=0){location.href = `stage${stagenum+1}.html`};
                //カスタムステージでの処理
                if(stagenum==-1){
                    playing = 0
                    clearTimeout(timer);//タイマーイベントの消去
                    //ゲーム画面を消す
                    document.getElementById("map").remove();
                    document.getElementById("player").remove();
                    document.getElementById("score").remove();
                    //隠していたエディタを元に戻す
                    document.getElementById("edit").style.display = 'block';
                    //エディタの中身を復元
                    for(i=0;i<map.length;i++){
                        document.getElementById('editmap').value+=map[i]
                        if(i!=map.length-1){document.getElementById('editmap').value+="\n"};
                    }
                };
            }
        }
        //押された時点でのタイムを記録しておく
        timep=time
    }, false);


    //方向キーが離されたら各変数を-1にする(初期値は0だが、離された瞬間を検知するため)
    document.addEventListener(`keyup`, function() {
        if(playing){
            if(event.key=="ArrowUp" && clear==0)KEYup=-1;
            if(event.key=="ArrowRight" && clear==0)KEYright=-1;
            if(event.key=="ArrowDown" && clear==0) KEYdown=-1;
            if(event.key=="ArrowLeft" && clear==0) KEYleft=-1;
            if(time==timep){upmove=1}//キーを押した時のタイムと今のタイムを比較して同じならupmoveの値を1にする
        }
    }, false)