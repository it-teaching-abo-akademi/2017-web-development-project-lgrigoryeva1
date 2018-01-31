var APP = {
	data : Array(),
	block : '',
	rate : 0,
	KEY: 'H5VLZNYK5KVWFX6M',
	url: 'https://www.alphavantage.co/query?',
	getGraphData: function(sid, id){ // retrieving data for the graph
		var f = 'function=TIME_SERIES_DAILY_ADJUSTED',
			s = '&symbol='+this.data[id].data[sid].Name,
			k = '&outputsize=full&apikey='+this.KEY,
			$this = this;
		
		block = $('.porfolio[data-id="'+(id+1)+'"]');
		var rate = this.data[id].Currency == 2 ? this.rate : 1;
		block.find('.graph').addClass('load');
		
		$.ajax({
			method: 'GET',
			url : this.url + f + s + k,
			success: function(e){
				block.find('.graph').removeClass('load');
				
				var data = Array();
				
				
				
				
				keys = Array();
				
				for (k in e["Time Series (Daily)"]) {
				    keys.push(k);
				}
				
				keys.sort();
				len = keys.length;
				
				for (i = 0; i < len; i++) {
				  k = keys[i];
				  
				  close =parseFloat(e["Time Series (Daily)"][k]["4. close"]);
				  open =parseFloat(e["Time Series (Daily)"][k]["1. open"]);
				  high =parseFloat(e["Time Series (Daily)"][k]["2. high"]);
				  low =parseFloat(e["Time Series (Daily)"][k]["3. low"]);
				  
				  data.push({ "date": new Date(k), "close" : close*rate, "open" : open*rate, "high" : high*rate, "low" : low*rate, "volume" : e["Time Series (Daily)"][k]["6. volume"] }) ;
				}
				
//				for(qt in e["Time Series (Daily)"]){
//				
//					
//				}
				//console.log(data);
				//data.sort(compare);
				
				block.find('.graph').append('<div id="graph" class="chart-draw"></div>');
				
				chart = AmCharts.makeChart( "graph",{ // AmCharts library 
				  "type": "stock",
				  "theme": "light",
				  "dataSets": [ {
				    "fieldMappings": [ {
				      "fromField": "open",
				      "toField": "open"
				    }, {
				      "fromField": "close",
				      "toField": "close"
				    }, {
				      "fromField": "high",
				      "toField": "high"
				    }, {
				      "fromField": "low",
				      "toField": "low"
				    }, {
				      "fromField": "volume",
				      "toField": "volume"
				    }, {
				      "fromField": "value",
				      "toField": "value"
				    } ],
				    "color": "#2196F3",
				    "dataProvider": data,
				    "categoryField": "date"
				  } ],
				  "balloon": {
				    "horizontalPadding": 13
				  },
				  "panels": [ {
				    "title": "Value",
				    "stockGraphs": [ {
				      "id": "g1",
				      "type": "candlestick",
				      "openField": "open",
				      "closeField": "close",
				      "highField": "high",
				      "lowField": "low",
				      "valueField": "close",
				      "lineColor": "#2196F3",
				      "fillColors": "#2196F3",
				      "negativeLineColor": "#CF000F",
				      "negativeFillColors": "#CF000F",
				      "fillAlphas": 1,
				      "balloonText": "open:<b>[[open]]</b><br>close:<b>[[close]]</b><br>low:<b>[[low]]</b><br>high:<b>[[high]]</b>",
				      "useDataSetColors": false
				    } ]
				  } ],
				  "scrollBarSettings": {
				    "graphType": "line",
				    "usePeriod": "WW"
				  },
				  "panelsSettings": {
				    "panEventsEnabled": true
				  },
				  "cursorSettings": {
				    "valueBalloonsEnabled": true,
				    "valueLineBalloonEnabled": true,
				    "valueLineEnabled": true
				  }
				});
				
				chart.addListener("init", function(){
					alert('+');
					block.find('.graph').find('#graph').removeAttr('id');
				});
			}
		})
		
	},
	getStocksData: function(){ // Retrieve stock data
		if(this.data.length == 0) return;
		for( pf in this.data){
			if(this.data[pf].data.length == 0) continue;
			var s = Array();
			for( st in this.data[pf].data){
				if(!this.data[pf].data[st].Name) continue;
				s.push(this.data[pf].data[st].Name);
			}
			s = s.join(',');
			if(s) this.get_symbol_value(s, pf);
		}
	},
	getStockData: function(pf){
		
		if(this.data[pf].data.length == 0) return;
		
		var s = Array();
			for( st in this.data[pf].data){
				if(!this.data[pf].data[st].Name) continue;
				s.push(this.data[pf].data[st].Name);
			}
			
		s = s.join(',');
		if(s) this.get_symbol_value(s, pf);

	},
	get_symbol_value: function(symbol, pf){ // retrieve data for one stock
		var f = 'function=BATCH_STOCK_QUOTES',
			s = '&symbols='+symbol,
			k = '&apikey='+this.KEY,
			$this = this;
		
		
		$.ajax({
			method: 'GET',
			url : this.url + f + s + k,
			success: function(e){
				block = $('.porfolio[data-id="'+(pf+1)+'"]');
				
				var data = {};
				
				for(qt in e["Stock Quotes"]){
					data[ e["Stock Quotes"][qt]['1. symbol'] ] = e["Stock Quotes"][qt]['2. price'];
				}
				sum = 0;		
				for( ind in $this.data[pf].data ){
				
					costBase = data[$this.data[pf].data[ind].Name];
					count = $this.data[pf].data[ind].Qty;
					
					currency = $this.data[pf].Currency;
					
					cost = currency == 2 ? $this.rate*costBase : costBase;
					total = count*cost;
					
					costPrint = accounting.formatNumber(parseFloat(cost), 4, " ", ".");
					totalPrint = accounting.formatNumber(parseFloat(total), 4, " ", ".");
					
					if(cost){
						$('.porfolio[data-id="'+(+pf+1)+'"]').find('.stock-one:not(.head)').eq(ind).find('.stock-value value').attr('data-base', parseFloat(costBase)).html(costPrint).removeAttr('data-value');
					} else {
						$('.porfolio[data-id="'+(+pf+1)+'"]').find('.stock-one:not(.head)').eq(ind).find('.stock-value value').attr('data-value', 0).removeAttr('data-base');
					}
					if($this.data[pf].data[ind].Qty != 0){
						$('.porfolio[data-id="'+(+pf+1)+'"]').find('.stock-one:not(.head)').eq(ind).find('.stock-tvalue value').attr('data-base', parseFloat(total)).html(totalPrint).removeAttr('data-value');
					}else{
						$('.porfolio[data-id="'+(+pf+1)+'"]').find('.stock-one:not(.head)').eq(ind).find('.stock-tvalue value').attr('data-value', 0).removeAttr('data-base');
					}	
					sum += total;
				}
				
				$('.porfolio[data-id="'+(+pf+1)+'"]').find('.total value').html(accounting.formatNumber(sum, 4, " ", "."));
			}
		})
	},
	get_rates : function(){ // Current currency rates
		var $this = this;
		
		$.ajax({
			method: 'GET',
			url : 'https://api.fixer.io/latest?base=USD',
			success: function(e){
				//var data = $.parseJSON(e);
				setTimeout(function(){
					$this.rate = e.rates['EUR'];
					$('#rate').html( $this.rate ).removeAttr('data-null');
					
					if($this.data.length > 0) $this.create_html();
				}, 250)
				
				
			}
		})
		
	},
	init : function(block){
		this.data = localStorage.getItem('Data') ? $.parseJSON(localStorage.getItem('Data')) : Array();
		this.block = block;
		
		
		this.get_rates();
	},
	create_html : function(){ // DOM initialization when loading LocalStorage 
		
		var $this = this;
		this.data.forEach(function(item, index){
			$this.create_portfolio(index+1, false, item);
		})
	},
	update : function(){
		localStorage.setItem('Data', $.toJSON(this.data) );
	},
	add_portfolio : function(){ // Add a portfolio
		if(this.data.length == 10) return;
		var portfolio = { data : Array(), obj : '', Name : this.create_portfolio_name(), Currency : 1};
		
		this.data.push(portfolio);
		
		portfolio.obj = this.create_portfolio(this.data.length, true, portfolio);
		
		this.update();
	},
	create_portfolio: function(index, focus, item){ // Create new portfolio
	
		var portfolio = $("<div class='porfolio' data-id='"+index+"' data-currency='"+item.Currency+"'><input class='title' id='p"+index+"' value=''/><a class='delete-portfolio'></a></div>");
		
		portfolio.append('<div class="currency"><a data-id="1" class="currency-one">$</a><a data-id="2" class="currency-one">€</a></div>');
		portfolio.append("<div class='graph'></div>");
		
		if(item.data) this.create_stocks(item, portfolio);
		
		portfolio.prependTo(this.block);
		
		input = document.getElementById('p'+index);
		if(focus) input.focus();
		input.value = item.Name;
		
		
		this.getStocksData();
		
		return portfolio;
	},
	create_portfolio_name: function(){
		return 'New portfolio';
	}, 
	delete_stock: function(pid, index){ // delete a stock
		this.data[pid].data.splice(index, 1);
		this.update();
	},
	
	create_stocks : function(item, block){ // create a new stock
	
		block.append("<div class='stocks'></div><span class='total'>Total value of portfolio: <value>0</value></span><a class='add-stock'>Add stock</a>");
		var st = block.find('.stocks');
		
		st.append("<div class='stock-one head'><div class='stock-name'>Name</div><div class='stock-value'>Unit value</div><div class='stock-qty'>Quantity</div><div class='stock-tvalue'>Total value</div></div><div class='stocks-body'></div>");
		
		for( el in item.data){
			st.find('.stocks-body').append("<div class='stock-one'><div class='stock-name'><input type='text' class='i-stock-name' value='"+item.data[el].Name+"'></div><div class='stock-value'><value data-value='0'>0.00</value></div><div class='stock-qty'><input type='text' class='i-stock-qty' value='"+item.data[el].Qty+"'></div><div class='stock-tvalue'><value data-value='0'>0.00</value></div><a class='delete-stock'><i class='fa fa-trash-o' aria-hidden='true'></i></a></div>");
		}
		
		
		
	},
	add_stock : function(id){ // add a stock
		
		var stock = { Name : '', Qty : 0};
		
		this.data[id].data.push(stock);
		this.create_stock(id, stock);
		
		this.update();
	},
	delete_portfolio: function(index){ // delete a portfolio
		this.data.splice(index, 1);
		this.update();
	},
	create_stock: function(id, item){
		 
		$('.porfolio[data-id="'+(id+1)+'"]').find('.stocks-body').append("<div class='stock-one'><div class='stock-name'><input type='text' id='new_stock' class='i-stock-name' value='"+item.Name+"'></div><div class='stock-value'><value data-value='0'>0.00</value></div><div class='stock-qty'><input type='text' class='i-stock-qty' value='"+item.Qty+"'></div><div class='stock-tvalue'><value data-value='0'>0.00</value></div><a class='delete-stock'><i class='fa fa-trash-o' aria-hidden='true'></i></a></div>");
		
		input = document.getElementById('new_stock');
		input.focus();
	},
	portfolio_data: function(index, data){ // update portfolio data
		for(elem in data){
			this.data[index][elem] = data[elem];
		}
		this.update();
	},
	stock_data: function(id, index, data){ // update stock data
	
		for(elem in data){
			this.data[id].data[index][elem] = data[elem];
		}
		this.update();
	}
}

APP.init( $('.content .portfolio-block') );
//APP.add_portfolio();
//APP.add_portfolio();

$(function(){ // anything related to clicking buttons etc
	$(document).on('click','.delete-portfolio' ,function(){
	
		var $portfolio = $(this).closest('.porfolio'),
			id = $portfolio.attr('data-id'),
			name = $portfolio.find('.title').val();
			
		if($portfolio.attr('data-graph') == 1){
			$portfolio.removeAttr('data-graph');
			$portfolio.find('.stock-one').removeClass('current');
			
			return;
		}		
			
		if(confirm('Delete "'+name+'" ? ')){
			$portfolio.remove();
			APP.delete_portfolio(id-1);
			$('.porfolio').each(function(){
				$(this).attr('data-id', $('.porfolio').size() - $(this).index())
					.find('input.title').attr('id', 'p'+($('.porfolio').size() - $(this).index()));
			})
		}
	})
	$(document).on('click','#add-portfolio' , function(e){ e.preventDefault(); APP.add_portfolio() })
	$(document).on('keyup','input.title' , function(){  
		if($(this).val() != ''){ APP.portfolio_data( $(this).closest('.porfolio').attr('data-id') - 1 ,{'Name': $(this).val()} ) }
	})
	
	var name_timer = '';
	
	$(document).on('keyup','input.i-stock-name' , function(){  
		var $this = $(this);
		
			if(name_timer != '') clearInterval(name_timer);
			name_timer = setInterval(function(){
					clearInterval(name_timer);
					if($this.val() != ''){ 
						APP.stock_data( $this.closest('.porfolio').attr('data-id') - 1, $this.closest('.stock-one').index(),{'Name': $this.val()} ) 
						APP.getStockData($this.closest('.porfolio').attr('data-id') - 1);
					}
			}, 450)
		
	})
	$(document).on('change','input.i-stock-name' , function(){  
		var $this = $(this);
		if($(this).val() != ''){ 
			if(name_timer != '') clearInterval(name_timer);
			APP.stock_data( $(this).closest('.porfolio').attr('data-id') - 1, $(this).closest('.stock-one').index(),{'Name': $(this).val()} ) 
			APP.getStockData($(this).closest('.porfolio').attr('data-id') - 1);
		}
	})
	
	
	function getTotal(ind){
		var sum = 0;
			rate = APP.data[ind-1].Currency == 1 ? 1 : APP.rate;
		$('.porfolio[data-id="'+ind+'"]').find('.stock-one:not(.head)').find('.stock-value').each(function(){
			
			$stock = $(this).closest('.stock-one');
			if( $stock.find('.stock-value value').attr('data-base') && $stock.find('input.i-stock-qty').val() > 0 ){
			
				sum += parseFloat($stock.find('.stock-value').find('value').attr('data-base'))*$stock.find('input.i-stock-qty').val()*rate;
			}
			
		})
		
		$('.porfolio[data-id="'+ind+'"]').find('.total').find('value').html( accounting.formatNumber(sum, 4, " ", ".") );
	}
	
	
	
	$(document).on('keyup','input.i-stock-qty' , function(){  
		var id = $(this).closest('.porfolio').attr('data-id') - 1;
		
		if($(this).val() != ''){ 
			$stock = $(this).closest('.stock-one');
			APP.stock_data( $(this).closest('.porfolio').attr('data-id') - 1, $stock.index(),{'Qty': $(this).val()} );
			
			if( $stock.find('.stock-value value').attr('data-base') ){
				rate = APP.data[id].Currency == 1 ? 1 : APP.rate;
				total = $(this).val()*parseFloat($stock.find('.stock-value').find('value').attr('data-base'))*rate;
				$stock.find('.stock-tvalue value').removeAttr('data-value').html( accounting.formatNumber(total, 4, " ", ".") );
				
				getTotal($(this).closest('.porfolio').attr('data-id'));
			}
		}
	})
	
	$(document).on('click','.currency-one' , function(){  
		var id = $(this).attr('data-id'),
			$portfolio = $(this).closest('.porfolio'),
			pid = $portfolio.attr('data-id');
		
		$portfolio.attr('data-currency', id);
		APP.portfolio_data( pid - 1 ,{'Currency': id} )
		
		var sum = 0;
			rate = APP.data[pid-1].Currency == 1 ? 1 : APP.rate;
			
		$portfolio.find('.stock-one:not(.head)').find('.stock-value').each(function(){
			
			$stock = $(this).closest('.stock-one');
			if( $stock.find('.stock-value value').attr('data-base') && $stock.find('input.i-stock-qty').val() > 0 ){
				
				v = parseFloat($stock.find('.stock-value').find('value').attr('data-base'))*rate;
				t = v*$stock.find('input.i-stock-qty').val();
				
				sum += t;
				
				$stock.find('.stock-value value').html( accounting.formatNumber(v, 4, " ", ".") )
				$stock.find('.stock-tvalue value').html( accounting.formatNumber(t, 4, " ", ".") )
			}
			
		})
		
		$portfolio.find('.total').find('value').html( accounting.formatNumber(sum, 4, " ", ".") );
		
		
	})
	
	$(document).on('click','.stocks-body .stock-one' , function(){ 
		var $pr = $(this).closest('.porfolio');
			$('.porfolio').find('.stock-one').removeClass('current');
		if( $pr.attr('data-graph') == 1 && $(this).is('.current')){
			$pr.removeAttr('data-graph');
			$pr.find('.chart-draw').remove();
		}else{
			$pr.find('.chart-draw').remove();
			
			$pr.attr('data-graph', 1);
			$(this).addClass('current');
			
			APP.getGraphData($(this).index(), $pr.attr('data-id')-1);
			
		}
	})
	$(document).on('click focus','.stocks-body .stock-one input' , function(e){ 
		e.stopPropagation()
	})
	$(document).on('keydown','.stock-name input' , function(e){ 
		if($(this).val().length >= 4 && e.which != 8  ) return false;
		
		$('.add-stock').removeClass('disabled');
	})
	$(document).on('click','.add-stock:not(.disabled)' , function(e){ 
		e.preventDefault();
		$(this).addClass('disabled')
		APP.add_stock( $(this).closest('.porfolio').attr('data-id') - 1 );
		
		
	})

	$(document).on('click','.delete-stock' ,function(e){
		e.preventDefault();
		e.stopPropagation();
		
		var $stock = $(this).closest('.stock-one'),
			id = $stock.index(),
			pid = $stock.closest('.porfolio').attr('data-id')-1;
			
		if(confirm('Delete Stock ? ')){
			$stock.remove();
			APP.delete_stock(pid, id);
			
			getTotal(pid+1);
		}
	})
})	

function compare(a,b) {
  if (a.day< b.day)
    return -1;
  if (a.day > b.day)
    return 1;
  return 0;
}