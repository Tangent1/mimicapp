function generator(){
	var pi = Math.atan(1)*4;
	var f = 1000;
	var fs = 44100;
	var input_data = new Array();
	var N = 1024;

	for(var i=0; i<=N-1; i++){
		input_data[i] = Math.sin(2*pi*f/fs*i);
	}

	dataInput(input_data);
}

function dataInput(input_data){

	var x = new Array();	//入力データ
	var y_re = new Array();	//実部
	var y_im = new Array();	//虚部
	
//	var N = input_data.length;
	var N = 1024;
	var fs = 44100;	//サンプリング周波数


	//データをセット
	for(var i=0; i<=N-1; i++){
		x[i] = input_data[i];
		y_re[i] = x[i];
		y_im[i] = 0.0;
	}

	FFT(x, y_re, y_im, N);
}

function FFT(x, y_re, y_im, N){
	//引数
	//x: 入力データ
	//y_re: 戻り値実部
	//y_im: 戻り値虚部
	//N: FFTサイズ

	//変数
	var pi;         //π
	var stageCount; //ステージ数
	var blockCount; //ブロック数
	var nodeCount;  //ノード数
	var stage;      //ステージ番号
	var block;      //ブロック番号
	var node;       //ノード番号
	var n1;         //計算用
	var n2;         //計算用
	var r;          //計算用
	var index;      //インデックス並べ替え用
	var re1;        //計算用
	var im1;        //計算用
	var re2;        //計算用
	var im2;        //計算用

	//FFTサイズ確認(データサイズは2のべき乗である必要がある)
	if((N & (N-1)) != 0){
		return;	//2のべき乗でなければ終わり
	}

	//計算準備
	pi = Math.atan(1)*4;    //π
	stageCount = Math.floor(Math.round(Math.log(N)/Math.log(2)));    //ステージ数

	//ステージごとに計算
	for(stage=0; stage<=stageCount-1; stage++){
		blockCount = Math.floor(Math.pow(2, stage));    //ブロック数
		nodeCount = N/blockCount;    //ノード数
		r = 2*pi/N*blockCount;    //定数

		//ブロックごとに計算
		for(block=0; block<=blockCount-1; block++){
			//ノードごとの計算
			for(node=0; node<=nodeCount/2 -1; node++){
				n1 = node+nodeCount*block;
				n2 = n1+nodeCount/2;
//				console.log("n1: " + n1 + " " + "n2: " + n2);
				re1 = y_re[n1];
				im1 = y_im[n1];
				re2 = y_re[n2];
				im2 = y_im[n2];
				y_re[n1] = re1+re2;
				y_im[n1] = im1+im2;
				y_re[n2] = (re1-re2)*Math.cos(r*node)-(im1-im2)*Math.sin(r*node);
				y_im[n2] = (re1-re2)*Math.sin(r*node)+(im1-im2)*Math.cos(r*node);
			}
		}
	}

	//並べ替えテーブル作成
	index = new Array(N);
	for(var i=0; i<=N-1; i++){
		index[i] = 0;
	}
	for(stage=0; stage<=stageCount-1; stage++){
		for(var i=0; i<=(Math.pow(2,stage)-1); i++){
			index[Math.floor((Math.pow(2,stage))+i)] = index[i]+Math.floor(Math.pow(2,stageCount-stage-1));
		}
	}

	//並べ替え
	for(var i=0; i<=N-1; i++){
		//console.log(index[i]);
		if(index[i] > i){
		//	console.log(index[i]+" > "+i);
			re1 = y_re[index[i]];
			im1 = y_im[index[i]];
			y_re[index[i]] = y_re[i];
			y_im[index[i]] = y_im[i];
			y_re[i] = re1;
			y_im[i] = im1;
		}
	}

	//振幅スペクトルを求める
	var R = new Array(N);	//振幅スペクトル
	for(var i=0; i<=N-1; i++){
		R[i] = Math.sqrt(Math.pow(y_re[i],2)+Math.pow(y_im[i],2));
	}

	debug(R, N);
}
	
function debug(R, N){
	//デバッグ
	for(i=0; i<=N-1; i++){
		//Alart("i = " + i + ": y(" + i + ") = " + y_re[i] + " + " + y_im[i] + "j");
		//Alart(y_re[i] + " + " + y_im[i] + "i");
		//console.log(44100 / N * i + ": " + y_re[i] + " " + y_im[i]);
		console.log(44100 / N * i + ": " + R[i]);
	}
}