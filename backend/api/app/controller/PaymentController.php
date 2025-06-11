<?php

namespace App\Controllers;
require_once __DIR__ . '/../../lib/stripe-php-17.3.0/init.php';

use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Exception\ApiErrorException;
use App\Core\Response; 

class PaymentController {

    public static function createPaymentIntent(): void {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            Response::json(['error' => 'Invalid request method'], 405);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);

        $amount = $input['amount'] ?? null;
        $currency = $input['currency'] ?? 'eur';

        if (empty($amount) || !is_numeric($amount) || $amount <= 0) {
            Response::json(['error' => 'Invalid amount provided'], 400);
            return;
        }

       $stripeSecretKey = 'sk_test_51RVEeLRsCw1rPgQ1qiyHOVPLgCTCVPcHWPEhdzpaI8t2zHNI1jAT16dzW3O2SsYzyklrZsqdaydOwQj3XgFcr6XV00nnZJVzUM'; // <-- ¡REEMPLAZA ESTO!

        Stripe::setApiKey($stripeSecretKey);
        Stripe::setApiVersion('2024-04-10'); 

        try {
            $paymentIntent = PaymentIntent::create([
                'amount' => $amount,
                'currency' => $currency,
                'payment_method_types' => ['card'],
            ]);

            Response::json(['clientSecret' => $paymentIntent->client_secret]);

        } catch (ApiErrorException $e) {
            error_log('Stripe API Error: ' . $e->getMessage());
            Response::json(['error' => 'Stripe API error: ' . $e->getMessage()], 500);
        } catch (\Exception $e) {
            error_log('General Error creating PaymentIntent: ' . $e->getMessage());
            Response::json(['error' => 'Could not create payment intent: ' . $e->getMessage()], 500);
        }
    }
}
