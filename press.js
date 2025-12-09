function press(){
    var a=document.getElementsByTagName('body')[0];
    var c=getComputedStyle(a).color;
    if(c!='black'){
        a.style.background='black'
        a.style.color='white'
        document.getElementsByTagName('img')[1].src='images/download.png'
        document.getElementsByTagName('ul')[0].style.color='white'

    } else {
        a.style.background='white'
        a.style.color='black'

    }
}