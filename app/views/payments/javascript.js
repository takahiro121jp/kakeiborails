var cleate_graph = function(name,percent){
  var element = document.getElementById(name) ;
  var context = element.getContext( "2d" ) ;

  context.beginPath () ;

  var angleA = 360 * ( percent / 100 ) ;
  var angleB = 360 * ( (100 - percent) / 100 ) ;

  context.beginPath () ;
  context.arc( 100, 100, 100, (0 - 90) * Math.PI / 180, (angleA - 90) * Math.PI / 180, false ) ;
  context.lineTo( 100, 100 ) ;
  context.fillStyle = "#16a4b4" ;
  context.fill() ;

  context.beginPath () ;
  context.arc( 100, 100, 100, (angleA - 90) * Math.PI / 180, ((angleA + angleB) - 90) * Math.PI / 180, false ) ;
  context.lineTo( 100, 100 ) ;
  context.fillStyle = "#EBEBEB" ;
  context.fill() ;
};

var match_graph = document.getElementsByClassName('match_graph');
for (var i = 0; i < match_graph.length; i++) {
  match_graph[i].setAttribute('id', 'graph_'+i);
  var name = match_graph[i].getAttribute('id');
  var percent = match_graph[i].getAttribute('data-percent');
  var percent_num =  match_graph[i].nextElementSibling.getElementsByTagName('span');
  percent_num[0].textContent = percent;
  cleate_graph(name,percent);
}
