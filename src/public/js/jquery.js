$(".list-group").on("mouseleave blur scroll wheel", function () {
    $("#listadoLocalesCollapse1").removeClass("show");
})

$(".input-producto-local").on("input", function () {
    $("#btn-input-producto-local").removeClass("btn-success").addClass("btn-warning");
})

$(".input-presentacion-producto-local").on("input", function () {
    $("#btn-input-presentacion-producto-local").removeClass("btn-success").addClass("btn-warning");
})
