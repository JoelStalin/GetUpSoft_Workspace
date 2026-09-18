#include "ElectricBoatPawn.h"

#include "BuoyancyComponent.h"
#include "Camera/CameraComponent.h"
#include "Components/StaticMeshComponent.h"
#include "GameFramework/SpringArmComponent.h"
#include "UObject/ConstructorHelpers.h"

AElectricBoatPawn::AElectricBoatPawn()
{
    PrimaryActorTick.bCanEverTick = true;
    AutoPossessPlayer = EAutoReceiveInput::Player0;

    HullMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("HullMesh"));
    SetRootComponent(HullMesh);
    HullMesh->SetSimulatePhysics(true);
    HullMesh->SetEnableGravity(true);
    HullMesh->SetCollisionProfileName(TEXT("PhysicsActor"));
    HullMesh->SetLinearDamping(0.15f);
    HullMesh->SetAngularDamping(1.5f);

    Buoyancy = CreateDefaultSubobject<UBuoyancyComponent>(TEXT("Buoyancy"));
    Buoyancy->BuoyancyData.bCenterPontoonsOnCOM = true;
    Buoyancy->BuoyancyData.BuoyancyCoefficient = 1.15f;
    Buoyancy->BuoyancyData.BuoyancyDamp = 700.0f;
    Buoyancy->BuoyancyData.BuoyancyDamp2 = 0.8f;
    Buoyancy->BuoyancyData.BuoyancyRampMinVelocity = 5.0f;
    Buoyancy->BuoyancyData.BuoyancyRampMaxVelocity = 35.0f;
    Buoyancy->BuoyancyData.BuoyancyRampMax = 1.4f;
    Buoyancy->BuoyancyData.MaxBuoyantForce = 12000000.0f;
    Buoyancy->BuoyancyData.bApplyDragForcesInWater = true;
    Buoyancy->BuoyancyData.DragCoefficient = 12.0f;
    Buoyancy->BuoyancyData.DragCoefficient2 = 0.08f;
    Buoyancy->BuoyancyData.AngularDragCoefficient = 2.5f;
    Buoyancy->BuoyancyData.MaxDragSpeed = 45.0f;
    Buoyancy->BuoyancyData.bApplyRiverForces = false;

    const FVector PontoonLocations[] = {
        FVector(300, -85, -45), FVector(300, 85, -45),
        FVector(80, -100, -55), FVector(80, 100, -55),
        FVector(-180, -90, -45), FVector(-180, 90, -45),
        FVector(-350, -65, -35), FVector(-350, 65, -35)
    };
    for (const FVector& Location : PontoonLocations)
    {
        FSphericalPontoon Pontoon;
        Pontoon.RelativeLocation = Location;
        Pontoon.Radius = 72.0f;
        Pontoon.bUseCenterSocket = false;
        Buoyancy->BuoyancyData.Pontoons.Add(Pontoon);
    }

    CameraBoom = CreateDefaultSubobject<USpringArmComponent>(TEXT("CameraBoom"));
    CameraBoom->SetupAttachment(HullMesh);
    CameraBoom->TargetArmLength = 1150.0f;
    CameraBoom->SetRelativeLocation(FVector(-80, 0, 260));
    CameraBoom->SetRelativeRotation(FRotator(-12, 0, 0));
    CameraBoom->bEnableCameraLag = true;
    CameraBoom->CameraLagSpeed = 4.0f;
    CameraBoom->bUsePawnControlRotation = true;

    FollowCamera = CreateDefaultSubobject<UCameraComponent>(TEXT("FollowCamera"));
    FollowCamera->SetupAttachment(CameraBoom, USpringArmComponent::SocketName);
}

void AElectricBoatPawn::BeginPlay()
{
    Super::BeginPlay();
    if (UStaticMesh* BoatAsset = LoadObject<UStaticMesh>(nullptr, TEXT("/Game/GetUpSoftBoat/Models/SM_ElectricBoat.SM_ElectricBoat")))
    {
        HullMesh->SetStaticMesh(BoatAsset);
    }
    HullMesh->SetMassOverrideInKg(NAME_None, AssumedMassKg, true);
    HullMesh->WakeAllRigidBodies();
    UE_LOG(LogTemp, Display, TEXT("GETUPSOFT_BOAT_RUNTIME_READY Mesh=%s MassKg=%.1f Pontoons=%d"),
        *GetNameSafe(HullMesh->GetStaticMesh()), AssumedMassKg, Buoyancy->BuoyancyData.Pontoons.Num());
}

void AElectricBoatPawn::Tick(float DeltaSeconds)
{
    Super::Tick(DeltaSeconds);
    if (!HullMesh || !HullMesh->IsSimulatingPhysics()) return;

    const FVector PropulsorLocation = HullMesh->GetComponentTransform().TransformPosition(FVector(-390, 0, -40));
    const FVector Thrust = GetActorForwardVector() * (ThrottleInput * MaxThrustNewtons * 100.0f);
    HullMesh->AddForceAtLocation(Thrust, PropulsorLocation);

    const FVector SteeringTorque = GetActorUpVector() * (SteerInput * FMath::Abs(ThrottleInput) * SteeringTorqueNm * 10000.0f);
    HullMesh->AddTorqueInRadians(SteeringTorque);
    SpeedKnots = FVector::DotProduct(HullMesh->GetPhysicsLinearVelocity(), GetActorForwardVector()) * 0.0194384f;
}

void AElectricBoatPawn::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
    Super::SetupPlayerInputComponent(PlayerInputComponent);
    PlayerInputComponent->BindAxis(TEXT("Throttle"), this, &AElectricBoatPawn::SetThrottle);
    PlayerInputComponent->BindAxis(TEXT("Steer"), this, &AElectricBoatPawn::SetSteer);
    PlayerInputComponent->BindAxis(TEXT("LookYaw"), this, &AElectricBoatPawn::LookYaw);
    PlayerInputComponent->BindAxis(TEXT("LookPitch"), this, &AElectricBoatPawn::LookPitch);
}

void AElectricBoatPawn::SetThrottle(float Value) { ThrottleInput = FMath::Clamp(Value, -1.0f, 1.0f); }
void AElectricBoatPawn::SetSteer(float Value) { SteerInput = FMath::Clamp(Value, -1.0f, 1.0f); }
void AElectricBoatPawn::LookYaw(float Value) { AddControllerYawInput(Value); }
void AElectricBoatPawn::LookPitch(float Value) { AddControllerPitchInput(Value); }
