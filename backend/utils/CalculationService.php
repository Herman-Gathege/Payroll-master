<?php
// backend/utils/CalculationService.php

class CalculationService
{
    /* ----------------------------------------------------------
        CONFIG — Kenya Statutory Rates
    ---------------------------------------------------------- */

    // PAYE Bands (Monthly)
    private static $PAYE_BANDS = [
        [24000, 0.10],   // 10% for first 24,000
        [32333, 0.25],   // 25% for next portion up to 32,333
        ['remainder', 0.30] // 30% on the rest
    ];

    private static $PERSONAL_RELIEF = 2400;

    // NSSF
    private static $NSSF_TIER_I_RATE  = 0.06; // 6%
    private static $NSSF_TIER_II_RATE = 0.06;
    private static $NSSF_TIER_I_CAP   = 7000;
    private static $NSSF_TIER_II_CAP  = 36000;

    // SHIF (progressive 2024+)
    private static $SHIF_BRACKETS = [
        [6000, 300],
        [7999, 400],
        [11999, 500],
        [14999, 600],
        [19999, 750],
        [24999, 850],
        [29999, 900],
        [34999, 950],
        [39999, 1000],
        [44999, 1100],
        [49999, 1200],
        [59999, 1300],
        [69999, 1400],
        [79999, 1500],
        [89999, 1600],
        [99999, 1700],
        ['remainder', 1800]
    ];

    // Housing Levy
    private static $HOUSING_RATE = 0.015; // 1.5%

    /* ----------------------------------------------------------
        PUBLIC ENTRY — Calculate from structure or gross
    ---------------------------------------------------------- */

    public static function calculate($basic, $allowances = [], $benefits = [])
    {
        $taxable_allowances = 0;
        $taxable_benefits   = 0;
        $non_taxable_benefits = 0;

        foreach ($allowances as $al) {
            if (($al['taxable'] ?? 1) == 1) {
                $taxable_allowances += ($al['amount'] ?? 0);
            }
        }

        foreach ($benefits as $b) {
            if (($b['taxable'] ?? 0) == 1) {
                $taxable_benefits += ($b['amount'] ?? 0);
            } else {
                $non_taxable_benefits += ($b['amount'] ?? 0);
            }
        }

        $gross = $basic + $taxable_allowances + $taxable_benefits;

        return self::calculateFromGross($gross, [
            'basic' => $basic,
            'allowances_taxable' => $taxable_allowances,
            'benefits_taxable' => $taxable_benefits,
            'benefits_non_taxable' => $non_taxable_benefits,
            'raw_allowances' => $allowances,
            'raw_benefits' => $benefits
        ]);
    }

    public static function calculateFromGross($gross, $meta = [])
    {
        /* -----------------------------------------
            NSSF
        ----------------------------------------- */
        $tier1_base = min($gross, self::$NSSF_TIER_I_CAP);
        $tier2_base = min(max($gross - self::$NSSF_TIER_I_CAP, 0), self::$NSSF_TIER_II_CAP - self::$NSSF_TIER_I_CAP);

        $nssf_employee =
            ($tier1_base * self::$NSSF_TIER_I_RATE) +
            ($tier2_base * self::$NSSF_TIER_II_RATE);

        $nssf_employer = $nssf_employee; // same rate

        /* -----------------------------------------
            Taxable income
        ----------------------------------------- */
        $taxable_income = $gross - $nssf_employee;

        /* -----------------------------------------
            PAYE
        ----------------------------------------- */
        $paye = self::computePAYE($taxable_income);

        // Apply relief
        $paye = max(0, $paye - self::$PERSONAL_RELIEF);

        /* -----------------------------------------
            SHIF
        ----------------------------------------- */
        $shif = self::computeSHIF($gross);

        /* -----------------------------------------
            Housing Levy
        ----------------------------------------- */
        $housing_levy = round($gross * self::$HOUSING_RATE, 2);

        /* -----------------------------------------
            Final totals
        ----------------------------------------- */
        $total_deductions = $paye + $nssf_employee + $shif + $housing_levy;
        $net = $gross - $total_deductions;

        return [
            'success' => true,
            'gross_pay' => round($gross, 2),
            'taxable_income' => round($taxable_income, 2),

            'nssf_employee' => round($nssf_employee, 2),
            'nssf_employer' => round($nssf_employer, 2),

            'paye' => round($paye, 2),
            'shif' => round($shif, 2),
            'housing_levy' => round($housing_levy, 2),

            'personal_relief' => self::$PERSONAL_RELIEF,

            'total_deductions' => round($total_deductions, 2),
            'net_salary' => round($net, 2),

            '_meta' => $meta
        ];
    }

    /* ----------------------------------------------------------
        HELPERS
    ---------------------------------------------------------- */

    private static function computePAYE($taxable)
    {
        $tax = 0;
        $remaining = $taxable;

        foreach (self::$PAYE_BANDS as $band) {
            [$limit, $rate] = $band;

            if ($limit === 'remainder') {
                $tax += $remaining * $rate;
                break;
            }

            if ($remaining <= $limit) {
                $tax += $remaining * $rate;
                return $tax;
            }

            $tax += $limit * $rate;
            $remaining -= $limit;
        }

        return $tax;
    }

    private static function computeSHIF($gross)
    {
        foreach (self::$SHIF_BRACKETS as $br) {
            [$limit, $amount] = $br;
            if ($limit === 'remainder') {
                return $amount;
            }
            if ($gross <= $limit) return $amount;
        }
        return 0;
    }
}
