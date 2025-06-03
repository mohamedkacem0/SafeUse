<?php

namespace App\Controllers;

// PaymentController.php is in backend/api/app/controller/
// Assuming vendor/ is in backend/api/vendor/ (i.e., composer install was run in backend/api/)
require_once __DIR__ . '/../../lib/stripe-php-17.3.0/init.php';

use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Exception\ApiErrorException;
use App\Core\Response; // Corregido de App\Utils\Response

class PaymentController {

    public static function createPaymentIntent(): void {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            Response::json(['error' => 'Invalid request method'], 405);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);

        $amount = $input['amount'] ?? null;
        $currency = $input['currency'] ?? 'eur'; // Default a EUR si no se provee

        if (empty($amount) || !is_numeric($amount) || $amount <= 0) {
            Response::json(['error' => 'Invalid amount provided'], 400);
            return;
        }

        // TODO: Reemplaza esto con tu clave secreta REAL de PRUEBA de Stripe (sk_test_...).
        // ¡NUNCA subas tu clave secreta REAL de PRODUCCIÓN (sk_live_...) a un repositorio!
        // Considera usar variables de entorno para las claves en producción.
        $stripeSecretKey = 'sk_test_51RVEeLRsCw1rPgQ1qiyHOVPLgCTCVPcHWPEhdzpaI8t2zHNI1jAT16dzW3O2SsYzyklrZsqdaydOwQj3XgFcr6XV00nnZJVzUM'; // <-- ¡REEMPLAZA ESTO!

        Stripe::setApiKey($stripeSecretKey);
        Stripe::setApiVersion('2024-04-10'); // O la versión más reciente que estés usando

        try {
            $paymentIntent = PaymentIntent::create([
                'amount' => $amount,
                'currency' => $currency,
                'payment_method_types' => ['card'],
                // Puedes añadir metadata adicional si lo deseas
                // 'metadata' => ['order_id' => 'some_order_id'],
            ]);

            Response::json(['clientSecret' => $paymentIntent->client_secret]);

        } catch (ApiErrorException $e) {
            // Manejo de errores específicos de Stripe
            error_log('Stripe API Error: ' . $e->getMessage());
            Response::json(['error' => 'Stripe API error: ' . $e->getMessage()], 500);
        } catch (\Exception $e) {
            // Manejo de otros errores
            error_log('General Error creating PaymentIntent: ' . $e->getMessage());
            Response::json(['error' => 'Could not create payment intent: ' . $e->getMessage()], 500);
        }
    }
}
