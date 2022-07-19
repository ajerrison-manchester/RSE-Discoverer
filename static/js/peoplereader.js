import $ from "jquery";


import * as vis from "vis-data/esnext";

export class PeopleReader{
    constructor(){
    }

    // Read in the people JSON file
    readPeopleFile(){
        let deferred = $.Deferred();
        let self = this;
        let url = new URL('../../static/json/people.txt', import.meta.url);
        $.getJSON(url.href).done(function(data){
            return deferred.resolve(data);
        }).fail(function(data){
            alert("There has been a problem reading the JSON data file.");
        });

        return deferred.promise();
    }

    // Create a node list from the people JSON file - the entire network
    largeNetworkFactory(peopleJSON){
        let nodeList = [];
        let edgeList = [];
        let x = 1;
        Object.keys(peopleJSON).forEach(function(personName,index, array) {
            nodeList.push({id: x, label: personName, color:{background: '#6666FF', highlight:{background: '#FF0000'}}, font:{color:'#FFFFFF'}, shape: 'box', group: 1});
            let personID = x;
            x++;
            peopleJSON[personName]["interests"].forEach(function(interest, index){
                
                let interestNode = nodeList.find(node => node.label == interest);
                let nodeID = 0;
                if ( interestNode == undefined){
                    nodeList.push({id: x, label: interest, color:{background: '#FFFF33', highlight:{background: '#FF0000'}}, group: 2});
                    nodeID = x;
                    x++;
                }
                else{
                    nodeID = interestNode.id;
                }
                
                edgeList.push({from: personID, to: nodeID, color:{highlight: '#FF0000'}});
                
            });
        });

        let visNodes = new vis.DataSet(nodeList);
        let visEdges = new vis.DataSet(edgeList);

        return {nodes: visNodes, edges: visEdges};
    }


    // Create a node list from the people JSON file - centred on the searched-for node
    smallNetworkFactory(peopleJSON, searchTerm){
        let nodeList = [];
        let edgeList = [];
        let x = 1;

        // Is the search term a person?
        let personName = Object.keys(peopleJSON).find(person => person.trim().toLowerCase() == searchTerm.trim().toLowerCase());
        if (personName !== undefined){ // yes
            nodeList.push({id: x, label: personName, color:{background: '#6666FF', highlight:{background: '#FF0000'}}, font:{color:'#FFFFFF'}, shape: 'box', group: 1});
            let personID = x;
            x++;
            peopleJSON[personName]["interests"].forEach(function(interest, index){
                let nodeID = 0;
                nodeList.push({id: x, label: interest, color:{background: '#FFFF33', highlight:{background: '#FF0000'}}, group: 2});
                nodeID = x;
                x++;
                
                edgeList.push({from: personID, to: nodeID, color:{highlight: '#FF0000'}});
                
            });
        }
        else{ // search term is not a person
            let found = false;
            let interestID = 0;
            let personID = 0;
            Object.keys(peopleJSON).forEach(function(personName,index, array) {
                let interestName = peopleJSON[personName]["interests"].find(interest => interest.trim().toLowerCase() == searchTerm.trim().toLowerCase());
                if (interestName !== undefined){
                    if (found == false){
                        found = true;
                        nodeList.push({id: x, label: interestName, color:{background: '#FFFF33', highlight:{background: '#FF0000'}}, group: 2});
                        interestID = x;
                        x++;
                    }

                    nodeList.push({id: x, label: personName, color:{background: '#6666FF', highlight:{background: '#FF0000'}}, font:{color:'#FFFFFF'}, shape: 'box', group: 1});
                    personID = x;
                    x++;

                    edgeList.push({from: personID, to: interestID, color:{highlight: '#FF0000'}});
                }
            });
        }

       

        let visNodes = new vis.DataSet(nodeList);
        let visEdges = new vis.DataSet(edgeList);

        return {nodes: visNodes, edges: visEdges};
    }

    // Return the people JSON as an array of strings for the autocomplete box
    flattenJSON(peopleJSON){

        let keywordList = [];
        Object.keys(peopleJSON).forEach(function(personName,index, array) {
            keywordList.push(personName);
            peopleJSON[personName]["interests"].forEach(function(interest, index){
                let keywordNode = keywordList.find(keyword => keyword == interest);
                if ( keywordNode == undefined){
                    keywordList.push(interest);
                }
            });
        });

        return keywordList;
    }
}