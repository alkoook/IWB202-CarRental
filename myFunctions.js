
$(document).ready(function () {

    // بيانات السيارات
    var cars = {
        "CR-001": { name: "Toyota Corolla", price: 250000 },
        "CR-002": { name: "Kia Sportage", price: 400000 },
        "CR-003": { name: "Hyundai Elantra", price: 300000 },
        "CR-004": { name: "Chevrolet Spark", price: 180000 },
        "CR-005": { name: "Nissan Sunny", price: 230000 }
    };

    // إظهار وإخفاء تفاصيل السيارات
    $(".details-toggle").change(function () {
        var code = $(this).val();
        var checked = $(this).prop("checked");

        $("#details-" + code).toggle(checked);
    });

    // إظهار نموذج الحجز
    $("#continueBtn").click(function () {

        if ($(".choose-car:checked").length === 0) {
            alert("يرجى اختيار سيارة واحدة على الأقل");
            return;
        }

        $("#bookingResult").hide().empty();
        $("#bookingArea").show();
    });

    // إلغاء النتيجة القديمة عند تغيير السيارات
    $(".choose-car").change(function () {
        $("#bookingResult").hide().empty();

        if ($(".choose-car:checked").length === 0) {
            $("#bookingArea").hide();
        }
    });

    // عرض رسالة خطأ
    function showError(field, message) {
        $("#" + field + "Error").text(message);
    }

    // التحقق من التاريخ وصحته
    function parseDate(value) {

        var match =
            /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

        if (!match) {
            return null;
        }

        var year = Number(match[1]);
        var month = Number(match[2]);
        var day = Number(match[3]);

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

    // التحقق عند إرسال النموذج
    $("#bookingForm").submit(function (event) {

        event.preventDefault();

        $(".field-error").text("");
        $("#bookingResult").hide().empty();

        var fullName = $("#fullName").val().trim();
        var nationalId = $("#nationalId").val().trim();
        var startText = $("#startDate").val().trim();
        var endText = $("#endDate").val().trim();
        var mobile = $("#mobile").val().trim();
        var email = $("#email").val().trim();

        var valid = true;

        // التحقق من الاسم العربي
        var arabicPattern =
            /^[\u0621-\u064A]+(?: +[\u0621-\u064A]+)*$/;

        if (fullName !== "" &&
            !arabicPattern.test(fullName)) {

            showError(
                "fullName",
                "الاسم يجب أن يحتوي على أحرف عربية فقط"
            );
            valid = false;
        }

        // التحقق من الرقم الوطني
        var nationalPattern =
            /^(0[1-9]|1[0-4])[0-9]{9}$/;

        if (!nationalPattern.test(nationalId)) {

            showError(
                "nationalId",
                "الرقم الوطني يجب أن يكون 11 رقماً ويبدأ من 01 إلى 14"
            );
            valid = false;
        }

        // التحقق من التواريخ
        var startDate = parseDate(startText);
        var endDate = parseDate(endText);

        if (startDate === null) {
            showError(
                "startDate",
                "أدخل تاريخ بداية صحيحاً بصيغة yyyy-mm-dd"
            );
            valid = false;
        }

        if (endDate === null) {
            showError(
                "endDate",
                "أدخل تاريخ نهاية صحيحاً بصيغة yyyy-mm-dd"
            );
            valid = false;
        }

        if (
            startDate !== null &&
            endDate !== null &&
            endDate <= startDate
        ) {
            showError(
                "endDate",
                "تاريخ النهاية يجب أن يكون بعد البداية"
            );
            valid = false;
        }

        // التحقق من الموبايل
        var mobilePattern =
            /^09[345689][0-9]{7}$/;

        if (mobile !== "" &&
            !mobilePattern.test(mobile)) {

            showError(
                "mobile",
                "رقم الموبايل غير صحيح"
            );
            valid = false;
        }

        // التحقق من البريد الإلكتروني
        var emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (email !== "" &&
            !emailPattern.test(email)) {

            showError(
                "email",
                "البريد الإلكتروني غير صحيح"
            );
            valid = false;
        }

        // السيارات المختارة
        var selectedCars = $(".choose-car:checked");

        if (selectedCars.length === 0) {
            alert("يرجى اختيار سيارة واحدة على الأقل");
            valid = false;
        }

        if (!valid) {
            return;
        }

        // حساب الأيام
        var days =
            (endDate.getTime() - startDate.getTime())
            / 86400000;

        // حساب الأسعار
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
                    " - الأيام: " + days +
                    " - السعر: " +
                    carTotal.toLocaleString("en-US") +
                    " ل.س"
                )
                .appendTo(resultList);
        });

        // خصم 10% إذا المدة أكثر من 7 أيام
        var discount = 0;

        if (days > 7) {
            discount = subtotal * 0.10;
        }

        var finalTotal = subtotal - discount;

        // عرض ملخص الحجز
        var result = $("#bookingResult");

        result.append(
            $("<h3></h3>").text("ملخص الحجز")
        );

        result.append(resultList);

        result.append(
            $("<p></p>").text(
                "عدد أيام التأجير: " + days
            )
        );

        result.append(
            $("<p></p>").text(
                "المجموع: " +
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

    });

});
