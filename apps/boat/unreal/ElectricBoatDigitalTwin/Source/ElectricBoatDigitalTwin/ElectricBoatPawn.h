#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Pawn.h"
#include "ElectricBoatPawn.generated.h"

class UBuoyancyComponent;
class UCameraComponent;
class USpringArmComponent;
class UStaticMeshComponent;

UCLASS(Blueprintable)
class ELECTRICBOATDIGITALTWIN_API AElectricBoatPawn : public APawn
{
    GENERATED_BODY()

public:
    AElectricBoatPawn();
    virtual void Tick(float DeltaSeconds) override;
    virtual void SetupPlayerInputComponent(UInputComponent* PlayerInputComponent) override;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Boat")
    TObjectPtr<UStaticMeshComponent> HullMesh;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Boat")
    TObjectPtr<UBuoyancyComponent> Buoyancy;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Camera")
    TObjectPtr<USpringArmComponent> CameraBoom;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Camera")
    TObjectPtr<UCameraComponent> FollowCamera;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Electric propulsion", meta=(ClampMin="0"))
    float MaxThrustNewtons = 18000.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Electric propulsion", meta=(ClampMin="0"))
    float SteeringTorqueNm = 14000.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Electric propulsion", meta=(ClampMin="0"))
    float AssumedMassKg = 3200.0f;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Telemetry")
    float SpeedKnots = 0.0f;

protected:
    virtual void BeginPlay() override;

private:
    void SetThrottle(float Value);
    void SetSteer(float Value);
    void LookYaw(float Value);
    void LookPitch(float Value);

    float ThrottleInput = 0.0f;
    float SteerInput = 0.0f;
};
