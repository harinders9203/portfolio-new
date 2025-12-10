function press(){
    var a=document.getElementsByTagName('body')[0];
    var c=getComputedStyle(a).color;
    if(c.includes("rgb(0, 0, 0)")){
        a.style.background='black'
        a.style.color='white'
        document.getElementsByTagName('img')[1].src='images/download.png'
        document.getElementsByTagName('img')[0].src='images/logo/fav-icon/bg removed.png'
        document.getElementById('img').src='images/logo/fav-icon/icon.png'
        // document.getElementById('li').style.background='white'
        document.getElementById('to-top').style.background='white'

    } else {
        a.style.background='white'
        a.style.color='black'

    }
}