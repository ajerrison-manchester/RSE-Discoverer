import $ from "jquery";
import autoComplete from "@tarekraafat/autocomplete.js"
import * as vis from "vis-network/esnext";
import * as bootstrap from "bootstrap";
import {PeopleReader} from "./static/js/peoplereader.js";

let peopleReader = new PeopleReader();

// Function to render the network on the screen (and configure it)
function drawNetwork(networkData){
  let networkContainer = document.getElementById("rsenetwork");
  let networkOptions = {
    layout:{
      improvedLayout: false,
    },
    physics: {
        forceAtlas2Based: {
          gravitationalConstant: -26,
          centralGravity: 0.005,
          springLength: 230,
          springConstant: 0.18,
          avoidOverlap:0
        },
        maxVelocity: 146,
        solver: "forceAtlas2Based",
        timestep: 0.35,
        stabilization: { iterations: 150 },
    },
  };
  let rseNetwork = new vis.Network(networkContainer, networkData, networkOptions);    
  
  rseNetwork.on("doubleClick", function (params) {
    if(params.nodes.length > 0){
      var nodeObj= this.body.nodes[params.nodes[0]].options;
      
      searchForTerm(nodeObj.label);
    }
  });
}

function searchForTerm(searchTerm){
  peopleReader.readPeopleFile().done(function(peopleJSON){
    let networkData = peopleReader.smallNetworkFactory(peopleJSON, searchTerm);
    drawNetwork(networkData);
  });
}

// When document is ready set up the autocomplete and initially load the entire network
$.when( $.ready ).then(function() {

    peopleReader.readPeopleFile().done(function(peopleJSON){
        
        // Load the entire network
        let networkData = peopleReader.largeNetworkFactory(peopleJSON);
        drawNetwork(networkData);

        // Autocomplete stuff.
        const autoCompleteJS = new autoComplete({
          selector: "#txtSearch",
          placeHolder: "Search for RSE or skill...",
          data: {
              src: peopleReader.flattenJSON(peopleJSON), 
              cache: true,
          },
          resultsList: {
              element: (list, data) => {
                  if (!data.results.length) {
                      const message = document.createElement("div");
                      message.setAttribute("class", "no_result");
                      message.innerHTML = `<span>Found No Results for "${data.query}"</span>`;
                      list.prepend(message);
                  }
              },
              noResults: true,
          },
          resultItem: {
              highlight: true,
          }
      });      
    });
});

// Search button clicked
$("#btnSearch").on("click", function(e){
  let searchTerm = $("#txtSearch").val();
  if(searchTerm !== null && searchTerm !== ""){
    searchForTerm(searchTerm);
  }
});

// Home links are clicked
$(".lnkHome").on("click", function(e){
  peopleReader.readPeopleFile().done(function(peopleJSON){
    let networkData = peopleReader.largeNetworkFactory(peopleJSON);
    drawNetwork(networkData);
  });
});

// Keyword is selected in autocomplete
document.querySelector("#txtSearch").addEventListener("selection", function (event) {
  $("#txtSearch").val(event.detail.selection.value);
});



    