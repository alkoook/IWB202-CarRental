
$(document).ready(function () {

    var cars = {
        "CR-001": { name: "Toyota Corolla", price: 250000 },
        "CR-002": { name: "Kia Sportage", price: 400000 },
        "CR-003": { name: "Hyundai Elantra", price: 300000 },
        "CR-004": { name: "Chevrolet Spark", price: 180000 },
        "CR-005": { name: "Nissan Sunny", price: 230000 }
    };

    $(".details-toggle").change(function () {
        var code = $(this).val();
        var checked = $(this).prop("checked");

        $("#details-" + code).toggle(checked);
    });

    function updateSelectedCars() {
        var list = $("#selectedCarsList");

        list.empty();

        $(".choose-car:checked").each(function () {
            var code = $(this).val();
            var car = cars[code];

            if (car) {
                $("<li></li>")
                    .text(
                        car.name + " - " +
                        car.price.toLocaleString("en-US") +
                        " ل.س يومياً"
                    )
                    .appendTo(list);
            }
        });
    }

    $("#continueBtn").click(function () {
        var selected = $(".choose-car:checked");

        if (selected.length === 0) {
            alert("يرجى اختيار سيارة واحدة على الأقل");
            return;
        }

        updateSelectedCars();

        $("#bookingResult").hide().empty();
        $("#bookingArea").show();

        $("html, body").stop().animate({
            scrollTop: $("#bookingArea").offset().top - 15
        }, 400);
    });

    $(".choose-car").change(function () {
        $("#bookingResult").hide().empty();

        if ($(".choose-car:checked").length === 0) {
            $("#bookingArea").hide();
            $("#selectedCarsList").empty();
        } else {
            updateSelectedCars();
        }
    });

    function showError(field, message) {
        $("#" + field + "Error").text(message);

        if (message !== "") {
            $("#" + field)
                .addClass("input-error")
                .attr("aria-invalid", "true");
        } else {
            $("#" + field)
                .removeClass("input-error")
                .attr("aria-invalid", "false");
        }
    }

    function parseDate(value) {
        var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

        if (!match) {
            return null;
        }

        var year = Number(match[1]);
        var month = Number(match[2]);
        var day = Number(match[3]);

        if (year < 1) {
            return null;
        }

        var date = new Date(0);
        date.setUTCHours(0, 0, 0, 0);
        date.setUTCFullYear(year, month - 1, day);

        if (
            date.getUTCFullYear() !== year ||
            date.getUTCMonth() !== month - 1 ||
            date.getUTCDate() !== day
        ) {
            return null;
        }

        return date;
    }

    function validateField(field) {
        var value = $("#" + field).val().trim();
        var message = "";

        if (field === "fullName") {
            var arabicPattern =
                /^[\u0621-\u064A]+(?: +[\u0621-\u064A]+)*$/;

            if (value !== "" && !arabicPattern.test(value)) {
                message = "الاسم يجب أن يحتوي على أحرف عربية فقط";
            }
        }

        if (field === "nationalId") {
            var nationalPattern =
                /^(0[1-9]|1[0-4])[0-9]{9}$/;

            if (value === "") {
                message = "الرقم الوطني مطلوب";
            } else if (!nationalPattern.test(value)) {
                message =
                    "الرقم الوطني يجب أن يكون 11 رقماً ويبدأ من 01 إلى 14";
            }
        }

        if (field === "startDate") {
            if (value === "") {
                message = "تاريخ بداية التأجير مطلوب";
            } else if (parseDate(value) === null) {
                message = "أدخل تاريخاً صحيحاً بصيغة yyyy-mm-dd";
            }
        }

        if (field === "endDate") {
            var startDate = parseDate(
                $("#startDate").val().trim()
            );

            var endDate = parseDate(value);

            if (value === "") {
                message = "تاريخ نهاية التأجير مطلوب";
            } else if (endDate === null) {
                message = "أدخل تاريخاً صحيحاً بصيغة yyyy-mm-dd";
            } else if (
                startDate !== null &&
                endDate <= startDate
            ) {
                message = "تاريخ النهاية يجب أن يكون بعد البداية";
            }
        }

        if (field === "mobile") {
            var mobilePattern = /^09[345689][0-9]{7}$/;

            if (value !== "" && !mobilePattern.test(value)) {
                message = "رقم الموبايل غير صحيح";
            }
        }

        if (field === "email") {
            var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (value !== "" && !emailPattern.test(value)) {
                message = "صيغة البريد الإلكتروني غير صحيحة";
            }
        }

        showError(field, message);

        return message === "";
    }

    $(".form-field input").blur(function () {
        validateField($(this).attr("id"));
    });

    $(".form-field input").on("input", function () {
        var field = $(this).attr("id");

        $("#bookingResult").hide().empty();

        if ($("#" + field + "Error").text() !== "") {
            validateField(field);
        }

        if (
            field === "startDate" &&
            $("#endDate").val().trim() !== ""
        ) {
            validateField("endDate");
        }
    });

    $("#bookingForm").submit(function (event) {
        event.preventDefault();

        $("#bookingResult").hide().empty();

        var fields = [
            "fullName",
            "nationalId",
            "startDate",
            "endDate",
            "mobile",
            "email"
        ];

        var firstError = null;

        $.each(fields, function (index, field) {
            if (!validateField(field) && firstError === null) {
                firstError = field;
            }
        });

        var selectedCars = $(".choose-car:checked");

        if (selectedCars.length === 0) {
            alert("يرجى اختيار سيارة واحدة على الأقل");
            $("#bookingArea").hide();
            return;
        }

        if (firstError !== null) {
            $("#" + firstError).focus();
            return;
        }

        var startDate = parseDate(
            $("#startDate").val().trim()
        );

        var endDate = parseDate(
            $("#endDate").val().trim()
        );

        var days =
            (endDate.getTime() - startDate.getTime())
            / 86400000;

        var subtotal = 0;
        var resultList = $("<ul></ul>");

        selectedCars.each(function () {
            var code = $(this).val();
            var car = cars[code];

            if (!car) {
                return;
            }

            var carTotal = car.price * days;
            subtotal += carTotal;

            $("<li></li>")
                .text(
                    car.name +
                    " - عدد الأيام: " + days +
                    " - المبلغ: " +
                    carTotal.toLocaleString("en-US") +
                    " ل.س"
                )
                .appendTo(resultList);
        });

        var discount = 0;

        if (days > 7) {
            discount = subtotal * 0.10;
        }

        var finalTotal = subtotal - discount;

        var result = $("#bookingResult");

        result.append(
            $("<h3></h3>").text("ملخص الحجز")
        );

        result.append(resultList);

        result.append(
            $("<p></p>").text(
                "مدة التأجير: " + days + " يوم"
            )
        );

        result.append(
            $("<p></p>").text(
                "المجموع قبل الخصم: " +
                subtotal.toLocaleString("en-US") +
                " ل.س"
            )
        );

        result.append(
            $("<p></p>").text(
                "الخصم: " +
                discount.toLocaleString("en-US") +
                " ل.س"
            )
        );

        result.append(
            $("<h3></h3>").text(
                "المبلغ النهائي: " +
                finalTotal.toLocaleString("en-US") +
                " ل.س"
            )
        );

        result.show();

        $("html, body").stop().animate({
            scrollTop: result.offset().top - 20
        }, 400);
    });

});
