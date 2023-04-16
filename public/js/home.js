//const { DateTime } = require("luxon");

$(document).ready(function () {
    enableSearch();
    enableAddMovie();
    enableUpdateMovie();
    initializeMovieModalFields();
    submitUpdateMovieForm();
    submitAddMovieForm();
});

/**
 * Submits the old and updated movie details to the database
 */
function submitUpdateMovieForm() {
    $(".update-movie").on('submit', function (event) {
        event.preventDefault();
        const id = $(this).children('.id').val();
        let data = {
            old_name: $("#movie-name-copy-" + id).val(),
            new_name: $("#update-movie-name-" + id).val(),
            old_year: $("#movie-year-copy-" + id).val(),
            new_year: $("#update-movie-year-" + id).val(),
            old_rank: $("#movie-rank-copy-" + id).val(),
            new_rank: $("#update-movie-rank-" + id).val(),
        };

        $("#modal-loading").modal("show");

        $.ajax({
            type: 'PUT',
            url: '/edit/' + id,
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function (result) {
                if (result.status) {
                    $("#modal-loading").modal().hide();
                    $("#modal-loading").modal("hide");  
                    $('.status-msg').text(result.msg);
                    $("#modal-success").modal("show");  
                } else {
                    $("#modal-loading").modal().hide();
                    $("#modal-loading").modal("hide");  
                    $('.status-msg').text(result.msg);
                    $("#modal-failed").modal("show");
                }
            }
        });
    });
}

/**
 * Submits the new movie entry to the database
 */
function submitAddMovieForm() {
    $(".add-movie").on('submit', function (event) {
        event.preventDefault();
        let data = {
            name: $("#add-movie-name").val(),
            year: $("#add-movie-year").val(),
            rank: $("#add-movie-rank").val(),
        };

        $("#modal-loading").modal("show");

        $.post('/add', data, function (result) {
            if (result.status) {
                $("#modal-loading").modal().hide();
                $("#modal-loading").modal("hide");  
                $('.status-msg').text(result.msg);
                $("#modal-success").modal("show");
            } else {
                $("#modal-loading").modal().hide();
                $("#modal-loading").modal("hide");  
                $('.status-msg').text(result.msg);
                $("#modal-failed").modal("show");
            }
        });
    });
}

/**
 * Submits the new movie entry to the database
 */
function submitDeleteMovieForm(id, year) {
    var x = '/delete/' + id + '/' + year;
    $(".modal-delete").on('submit', function (event) {
        event.preventDefault();
        $("#modal-loading").modal("show");
        $.post(x, function (result) {
            if (result.status) {
                $("#modal-loading").modal().hide();
                $("#modal-loading").modal("hide");  
                $('.status-msg').text(result.msg);
                $("#modal-success").modal("show");
            } else {
                $("#modal-loading").modal().hide();
                $("#modal-loading").modal("hide");  
                $('.status-msg').text(result.msg);
                $("#modal-failed").modal("show");
            }
        });
    });
}

function getQuerySearch(page) {
    let data = {
        queryholder: $('#query').text(),
        node: $('#node').text(),
        pageNumber: page
    }

    // if select, redirect to dev menu with select query
    if (data.queryholder.substring(0, 6).toUpperCase() == 'SELECT') {
        $.post('/devMenu/select', data, function (result) {
            if (result) {
                $('#movies-num-rows-p').text('Showing ' + result.resultlen + ' row(s).')
                $('#temp').empty();
                $('#temp').append(result.table);
                $('#temp').append(result.pagination);
            }
            else {
                $('.status-msg').text('Query failed.');
                $("#modal-failed").modal("show");
                $(".okay-btn").attr("href", "#");
            }
        });
    }
}

function submitQuerySearch() {
    $(".query-search").on('submit', function (event) {
        event.preventDefault();

        let data = {
            queryholder: $('#queryholder').val(),
            node: $('input[name=btnradio]:checked').val(),
            pageNumber: 1
        }

        // if select, redirect to dev menu with select query
        if (data.queryholder.substring(0, 6).toUpperCase() == 'SELECT') {
            $.post('/devMenu/select', data, function (result) {
                if (result) {
                    $('#movies-num-rows-p').text('Showing ' + result.resultlen + ' row(s).')
                    $('#temp').empty();
                    $('#temp').append(result.table);
                    $('#temp').append(result.pagination);
                }
                else {
                    $('.status-msg').text('Query failed.');
                    $("#modal-failed").modal("show");
                    $(".okay-btn").attr("href", "/devMenu");
                }
            });
        }
    });
}

/**
 * Checks if the input for movie name is valid.
 * 
 * @param       input - movie name input
 * @returns     result: [validity(boolean), error message(string)]
 */
function validateMovieName(input) {
    if (!input)
        return [false, 'Movie name cannot be empty.']
    else
        return [true, '']
}
/**
 * Checks if the input for movie year is valid.
 * @param       input - movie year input
 * @returns     result: [validity(boolean), error message(string)]
 */
function validateMovieYear(input) {
    if (!input)
        return [false, 'Movie year cannot be empty.']
    else if (parseInt(input) < 1700)
        return [false, 'Invalid year.']
    else
        return [true, '']
}

/**
 * Checks if the input for mvie rank is valid.
 * @param       input  - movie rank input
 * @returns     result: [validity(boolean), error message(string)]
 */
function validateMovieRank(input) {
    if (!input)
        return [true, '']
    else if (parseInt(input) <= 0)
        return [false, 'Invalid rank.']
    else
        return [true, '']
}

/** 
 * Dev Menu: Checks if the input for SELECT query is valid. 
 * @param       input - SELECT query input
 * @returns     result: [validity(boolean), error message(string)] 
 */
function validateQuery(input) {
    var substr = input.substring(0, 7);
    substr = substr.toUpperCase();
    if (!input.trim())
        return [true, '']
    else {
        if (substr == 'SELECT ')
            return [true, '']
        else
            return [false, 'Invalid SELECT query.']
    }
}

/**
 * Checks if at least one of the input fields has invalid input.
 * @param       moviename 
 * @param       year 
 * @param       rank 
 * @returns     validity result for each field 
 */
function validateMovieEntry(moviename, year, rank) {
    var resultyear = validateMovieYear(year);
    var resultrank = validateMovieRank(rank);

    if (
        (moviename && resultyear[0] && resultrank[0]) ||
        (moviename == year && year == rank)
    )
        return [true, ''];
    else {
        if (!moviename) {
            if (!resultyear[0]) {
                return [
                    false, 'Invalid year.',
                    resultyear[0], resultyear[1],
                    resultrank[0], resultrank[1]];
            } else {
                return [
                    false, 'Movie name cannot be empty.',
                    resultyear[0], resultyear[1],
                    resultrank[0], resultrank[1]];
            }
        } else {
            if (!resultyear[0])
                return [
                    false, 'Invalid year.',
                    resultyear[0], resultyear[1],
                    resultrank[0], resultrank[1]];
            else {
                if (!resultrank[0])
                    return [
                        false, 'Invalid rank.',
                        resultyear[0], resultyear[1],
                        resultrank[0], resultrank[1]];
                else return [true, ''];
            }
        }
    }
}

/**
 * For displaying the error for the fields with invalid input.
 * @param       inputField - ID of the input field where the invalid input is.
 * @param       errorField - ID of the field where the error message will be displayed.
 * @param       errorText - error message for the invalid input
 */
function displayError(inputField, errorField, errorText) {
    errorField.text(errorText);
    inputField.addClass('is-invalid');
}

/**
 * For resetting the visual of the invalid fields.
 * @param       inputField - ID of the input field where the invalid input was.
 * @param       errorField - ID of the field where the error message was displayed. 
 */
function resetField(inputField, errorField) {
    errorField.text('');
    inputField.removeClass('is-invalid');
}


/**
 * Dev Menu: Enables the search button for the query input whenever the input is valid.
 */
function enableSearch() {
    $('#queryholder').on('change', function () {
        var query = $('#queryholder').val();
        var result = validateQuery(query);
        console.log(query)
        if (result[0]) {
            resetField($('#queryholder'), $('#query-error'))
            $('#search').attr('disabled', !result[0]);
            if (!query.trim())
                $('#search').attr('disabled', result[0]);
        }
        else {
            displayError($('#queryholder'), $('#query-error'), result[1])
            $('#search').attr('disabled', !result[0]);
        }
    });
}

/**
 * Enables the Add Movie button of movie name, year, and rank inputs are valid.
 */
function enableAddMovie() {
    $('#add-movie-name, #add-movie-year, #add-movie-rank').on('change', function () {
        var aname = $('#add-movie-name').val().trim();
        var ayear = $('#add-movie-year').val().trim();
        var arank = $('#add-movie-rank').val().trim();
        var result = validateMovieEntry(aname, ayear, arank);
        $('.add-movie-button').attr('disabled', !result[0]);

        if (!result[0]) {
            if (result[1] == 'Movie name cannot be empty.' || !aname) {
                displayError(
                    $('#add-movie-name'),
                    $('#add-movie-error'),
                    result[1]
                );
                $('#add-movie-year').removeClass('is-invalid');
                $('#add-movie-rank').removeClass('is-invalid');
            } else if (result[1] == 'Invalid year.') {
                displayError(
                    $('#add-movie-year'),
                    $('#add-movie-error'),
                    result[1]
                );
                $('#add-movie-name').removeClass('is-invalid');
                $('#add-movie-rank').removeClass('is-invalid');
            } else {
                displayError(
                    $('#add-movie-rank'),
                    $('#add-movie-error'),
                    result[1]
                );
                $('#add-movie-name').removeClass('is-invalid');
                $('#add-movie-year').removeClass('is-invalid');
            }
        } else {
            resetField($('#add-movie-year'), $('#add-movie-error'));
            resetField($('#add-movie-rank'), $('#add-movie-error'));
            resetField($('#add-movie-name'), $('#add-movie-error'));
            if (!aname)
                $('.add-movie-button').attr('disabled', result[0]);
        }
    });
}

/**
 * Enables the Update Movie button of movie name, year, and rank inputs are valid.
 * The Update Movie button remains disabled if there are no changes.
 */
function enableUpdateMovie() {
    $('.updateBtn').click(function () {
        const movieid = $(this).attr('data-id');
        var iname = '#update-movie-name-' + movieid;
        var iyear = '#update-movie-year-' + movieid;
        var irank = '#update-movie-rank-' + movieid;
        var cname = '#movie-name-copy-' + movieid;
        var cyear = '#movie-year-copy-' + movieid;
        var crank = '#movie-rank-copy-' + movieid;
        var error = '#update-movie-error-' + movieid;
        var updatebtn = '#update-movie-button-' + movieid;
        var x = iname + ',' + iyear + ',' + irank;
        $(x).on('change', function () {
            var input = {
                aname: $(iname).val().trim(),
                ayear: $(iyear).val().trim(),
                arank: $(irank).val().trim()
            }
            var copy = {
                aname: $(cname).val().trim(),
                ayear: $(cyear).val().trim(),
                arank: $(crank).val().trim()
            }

            if (input.aname == copy.aname && input.ayear == copy.ayear && input.arank == copy.arank) {
                resetField($(iname), $(error));
                resetField($(iyear), $(error));
                resetField($(irank), $(error));
                $(updatebtn).attr('disabled', true);
            }
            else {
                var result = validateMovieEntry(input.aname, input.ayear, input.arank);
                $(updatebtn).attr('disabled', !result[0]);

                if (!result[0]) {
                    if (result[1] == 'Movie name cannot be empty.' || !input.aname) {
                        displayError(
                            $(iname),
                            $(error),
                            result[1]
                        );
                        $(iyear).removeClass('is-invalid');
                        $(irank).removeClass('is-invalid');
                    } else if (result[1] == 'Invalid year.') {
                        displayError(
                            $(iyear),
                            $(error),
                            result[1]
                        );
                        $(iname).removeClass('is-invalid');
                        $(irank).removeClass('is-invalid');
                    } else {
                        displayError(
                            $(irank),
                            $(error),
                            result[1]
                        );
                        $(iname).removeClass('is-invalid');
                        $(iyear).removeClass('is-invalid');
                    }
                } else {
                    resetField($(iyear), $(error));
                    resetField($(irank), $(error));
                    resetField($(iname), $(error));
                    if (!input.aname)
                        $(updatebtn).attr('disabled', result[0]);
                }
            }
        });
    })
}

/**
 * Resets the values of the Add/Update Modal fields.
 */
function initializeMovieModalFields() {
    $('.modal-insert').on('hidden.bs.modal', function () {
        $('#add-movie-name, #add-movie-year, #add-movie-rank').val('');
        resetField($('#add-movie-year'), $('#add-movie-error'));
        resetField($('#add-movie-rank'), $('#add-movie-error'));
        resetField($('#add-movie-name'), $('#add-movie-error'));
        $('.add-movie-button').attr('disabled', true);
    });
    $('.modal-update').on('hidden.bs.modal', function () {
        $('.update-movie').each(function () {
            const movieid = $(this).children('.id').val();
            var iname = '#update-movie-name-' + movieid;
            var iyear = '#update-movie-year-' + movieid;
            var irank = '#update-movie-rank-' + movieid;
            var cname = '#movie-name-copy-' + movieid;
            var cyear = '#movie-year-copy-' + movieid;
            var crank = '#movie-rank-copy-' + movieid;
            var error = '#update-movie-error-' + movieid;
            var updatebtn = '#update-movie-button-' + movieid;
            $(iname).val($(cname).val());
            $(iyear).val($(cyear).val());
            $(irank).val($(crank).val());
            resetField($(iyear), $(error));
            resetField($(irank), $(error));
            resetField($(iname), $(error));
            $(updatebtn).attr('disabled', true);
        });
    })
}

/**
 * Function for setting a node (radio button)
 */
function setNode() {
    $('.node-btn').on('change', function () {
        if (document.getElementById('btnradio1').checked) {

        }
        if (document.getElementById('btnradio2').checked) {

        }
        if (document.getElementById('btnradio3').checked) {

        }
    });
}