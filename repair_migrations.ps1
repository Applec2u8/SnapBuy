$migrations = @(
    @{ id = "20260712"; status = "reverted" },
    @{ id = "20260714184800"; status = "reverted" },
    @{ id = "20260714184801"; status = "reverted" },
    @{ id = "20260714194800"; status = "reverted" },
    @{ id = "20260714200000"; status = "reverted" },
    @{ id = "20260714202500"; status = "reverted" },
    @{ id = "20260714204500"; status = "reverted" },
    @{ id = "20260714210000"; status = "reverted" },
    @{ id = "20260714210500"; status = "reverted" },
    @{ id = "20260714220000"; status = "reverted" },
    @{ id = "20260714230000"; status = "reverted" },
    @{ id = "20260714233000"; status = "reverted" },
    @{ id = "20260714234500"; status = "reverted" },
    @{ id = "20260719"; status = "applied" }
)

foreach ($m in $migrations) {
    Write-Host "Repairing $($m.id) as $($m.status)..."
    npx supabase migration repair --status $m.status $m.id
}

Write-Host "All migrations repaired. Pulling schema..."
npx supabase db pull --schema public

Write-Host "Done!"
