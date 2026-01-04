<?php

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $name    = htmlspecialchars($_POST["name"]);
    $email   = htmlspecialchars($_POST["email"]);
    $event   = htmlspecialchars($_POST["event"]);
    $message = htmlspecialchars($_POST["message"]);

    // ✅ CHANGE THIS TO YOUR RECEIVING EMAIL
    $to = "linntrevagmail@gmail.com";
    $subject = "New Event Booking - MissPetals & Events";

    $body = "
    Name: $name\n
    Email: $email\n
    Event Type: $event\n
    Message:\n$message
    ";

    $headers = "From: $email";

    if (mail($to, $subject, $body, $headers)) {
        echo "<script>alert('Message sent successfully!'); window.location.href='index.html';</script>";
    } else {
        echo "<script>alert('Failed to send message. Try again.'); window.location.href='index.html';</script>";
    }
}
?>
