function report() {
    console.log("hello");
    var startLocation = document.getElementById("startLocation").value;
    var endLocation = document.getElementById("endLocation").value;

    console.log(startLocation);
    console.log(endLocation);

    var checkedPotholes = document.getElementById("potholes").checked;
    var checkedTrees = document.getElementById("trees").checked;

    console.log(checkedPotholes);
    console.log(checkedTrees);
}
