import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Home, 
  MapPin, 
  Ruler, 
  User, 
  Calendar,
  PackagePlus,
  Leaf,
  Trash2,
  Edit,
  AlertTriangle,
  Download
} from "lucide-react";
import { format } from "date-fns";
import { Header } from "@/components/layout/Header";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useFarm } from "@/context/FarmContext";
import { CarbonChart } from "@/components/dashboard/CarbonChart";
import { ProjectionChart } from "@/components/dashboard/ProjectionChart";
import { ActionCard } from "@/components/dashboard/ActionCard";
import { 
  generateProjections, 
  generateRecommendedActions, 
  exportFarmDataToCsv 
} from "@/lib/farm-utils";
import { FarmComplete } from "@/types/farm";

const FarmDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getFarmById, deleteFarm } = useFarm();
  const [farm, setFarm] = useState<FarmComplete | null>(null);
  
  useEffect(() => {
    if (id) {
      const farmData = getFarmById(id);
      if (farmData) {
        setFarm(farmData);
      } else {
        navigate("/farms");
      }
    }
  }, [id, getFarmById, navigate]);
  
  const handleDelete = () => {
    if (id) {
      deleteFarm(id);
      navigate("/farms");
    }
  };
  
  const handleExport = () => {
    if (!farm) return;
    
    const csvContent = exportFarmDataToCsv(farm);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${farm.farm.name.replace(/\s+/g, '_')}_data.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (!farm) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green-700"></div>
        </div>
      </Layout>
    );
  }
  
  const { farm: farmData, cattle, pasture, carbon } = farm;
  
  const projections = generateProjections(farm);
  const recommendations = generateRecommendedActions(farm);
  
  return (
    <Layout>
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => navigate("/farms")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Header title={farmData.name} subtitle={farmData.location} />
      </div>
      
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <Badge variant="outline" className="flex items-center gap-1 text-farm-green-700 border-farm-green-200 bg-farm-green-50">
            <Home size={14} />
            <span>{farmData.size} hectares</span>
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 text-farm-brown-700 border-farm-brown-200 bg-farm-brown-50">
            <PackagePlus size={14} />
            <span>{cattle.totalHead} {cattle.cattleType}</span>
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 text-farm-gold-700 border-farm-gold-200 bg-farm-gold-50">
            <Leaf size={14} />
            <span>{pasture.totalPastures} Pastures</span>
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-1"
            onClick={handleExport}
          >
            <Download size={16} />
            Export Data
          </Button>
          <Button 
            variant="outline" 
            className="gap-1 border-blue-500 text-blue-600 hover:bg-blue-50"
            onClick={() => navigate(`/farms/${id}/edit`)}
          >
            <Edit size={16} />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                className="gap-1 border-red-500 text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Delete Farm
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {farmData.name}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="mb-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Farm Details</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
          <TabsTrigger value="actions">Recommended Actions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CarbonChart carbonData={carbon!} />
            
            <Card>
              <CardHeader>
                <CardTitle>Farm Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Owner/Manager</dt>
                    <dd className="mt-1 flex items-center">
                      <User className="h-4 w-4 mr-1 text-farm-brown-600" />
                      {farmData.ownerName}
                    </dd>
                  </div>
                  
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Location</dt>
                    <dd className="mt-1 flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-farm-brown-600" />
                      {farmData.location}
                    </dd>
                  </div>
                  
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Farm Size</dt>
                    <dd className="mt-1 flex items-center">
                      <Ruler className="h-4 w-4 mr-1 text-farm-brown-600" />
                      {farmData.size} hectares
                    </dd>
                  </div>
                  
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                    <dd className="mt-1 flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-farm-brown-600" />
                      {format(new Date(farmData.createdAt), "MMMM d, yyyy")}
                    </dd>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Cattle</dt>
                    <dd className="mt-1 flex items-center">
                      <PackagePlus className="h-4 w-4 mr-1 text-farm-brown-600" />
                      {cattle.totalHead} head of {cattle.cattleType}
                    </dd>
                    <dd className="mt-1 ml-5 text-sm text-muted-foreground">
                      Average weight: {cattle.averageWeight} kg
                    </dd>
                    <dd className="mt-1 ml-5 text-sm text-muted-foreground">
                      Method of raising: {cattle.methodOfRaising.charAt(0).toUpperCase() + cattle.methodOfRaising.slice(1)}
                    </dd>
                  </div>
                  
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Pasture Management</dt>
                    <dd className="mt-1 flex items-center">
                      <Leaf className="h-4 w-4 mr-1 text-farm-brown-600" />
                      {pasture.totalPastures} pastures, avg. {pasture.averagePastureSize} hectares each
                    </dd>
                    <dd className="mt-1 ml-5 text-sm text-muted-foreground">
                      Rotations per season: {pasture.rotationsPerSeason}
                    </dd>
                    <dd className="mt-1 ml-5 text-sm text-muted-foreground">
                      Resting days per pasture: {pasture.restingDaysPerPasture}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProjectionChart 
              twoYearData={projections.twoYear}
              fiveYearData={projections.fiveYear}
              tenYearData={projections.tenYear}
              metricKey="profitability"
              title="Profitability"
              yAxisLabel="Profit ($)"
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Key Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {recommendations.slice(0, 3).map((action, index) => (
                    <li key={action.id} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-farm-green-100 text-farm-green-600">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{action.title}</h4>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Farm Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Farm Name</dt>
                      <dd className="mt-1">{farmData.name}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Location</dt>
                      <dd className="mt-1">{farmData.location}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Size</dt>
                      <dd className="mt-1">{farmData.size} hectares</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Owner/Manager</dt>
                      <dd className="mt-1">{farmData.ownerName}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                      <dd className="mt-1">{format(new Date(farmData.createdAt), "MMMM d, yyyy")}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                      <dd className="mt-1">{format(new Date(farmData.updatedAt), "MMMM d, yyyy")}</dd>
                    </div>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Cattle Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Total Head</dt>
                      <dd className="mt-1">{cattle.totalHead}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Cattle Type/Breed</dt>
                      <dd className="mt-1">{cattle.cattleType}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Average Weight</dt>
                      <dd className="mt-1">{cattle.averageWeight} kg</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Method of Raising</dt>
                      <dd className="mt-1">{cattle.methodOfRaising.charAt(0).toUpperCase() + cattle.methodOfRaising.slice(1)}</dd>
                    </div>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Pasture Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Total Pastures</dt>
                      <dd className="mt-1">{pasture.totalPastures}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Average Pasture Size</dt>
                      <dd className="mt-1">{pasture.averagePastureSize} hectares</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Rotations Per Season</dt>
                      <dd className="mt-1">{pasture.rotationsPerSeason}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Resting Days Per Pasture</dt>
                      <dd className="mt-1">{pasture.restingDaysPerPasture} days</dd>
                    </div>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Grass/Forage Types</dt>
                    <dd className="mt-1 flex flex-wrap gap-2">
                      {pasture.grassTypes.map((grass, index) => (
                        <Badge key={index} variant="outline" className="bg-farm-green-50">
                          {grass}
                        </Badge>
                      ))}
                    </dd>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Soil Health Score</dt>
                      <dd className="mt-1">{pasture.soilHealthScore || "N/A"}/10</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Current Forage Density</dt>
                      <dd className="mt-1">{pasture.currentForageDensity || "N/A"} kg/hectare</dd>
                    </div>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Carbon Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Current Emissions</dt>
                      <dd className="mt-1">{carbon?.currentEmissions.toFixed(1)} tons CO2/year</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Current Capture</dt>
                      <dd className="mt-1">{carbon?.currentCapture.toFixed(1)} tons CO2/year</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Current Net Impact</dt>
                      <dd className="mt-1 flex items-center">
                        {(carbon?.currentCapture! - carbon?.currentEmissions!).toFixed(1)} tons CO2/year
                        {(carbon?.currentCapture! - carbon?.currentEmissions!) >= 0 ? (
                          <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">Carbon Positive</Badge>
                        ) : (
                          <Badge className="ml-2 bg-amber-100 text-amber-800 border-amber-200">Carbon Negative</Badge>
                        )}
                      </dd>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Potential Emissions</dt>
                      <dd className="mt-1">{carbon?.potentialEmissions.toFixed(1)} tons CO2/year</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Potential Capture</dt>
                      <dd className="mt-1">{carbon?.potentialCapture.toFixed(1)} tons CO2/year</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Potential Net Impact</dt>
                      <dd className="mt-1 flex items-center">
                        {(carbon?.potentialCapture! - carbon?.potentialEmissions!).toFixed(1)} tons CO2/year
                        <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">Carbon Positive</Badge>
                      </dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Improvement Potential</dt>
                      <dd className="mt-1 text-farm-green-700 font-semibold">
                        {(((carbon?.potentialCapture! - carbon?.potentialEmissions!) - 
                          (carbon?.currentCapture! - carbon?.currentEmissions!)) / 
                          Math.abs(carbon?.currentCapture! - carbon?.currentEmissions!) * 100).toFixed(0)}% increase
                      </dd>
                    </div>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="projections" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProjectionChart 
              twoYearData={projections.twoYear}
              fiveYearData={projections.fiveYear}
              tenYearData={projections.tenYear}
              metricKey="netCarbon"
              title="Carbon Balance"
              yAxisLabel="Net Carbon (tons CO2)"
            />
            
            <ProjectionChart 
              twoYearData={projections.twoYear}
              fiveYearData={projections.fiveYear}
              tenYearData={projections.tenYear}
              metricKey="soilHealth"
              title="Soil Health"
              yAxisLabel="Soil Health Score"
            />
            
            <ProjectionChart 
              twoYearData={projections.twoYear}
              fiveYearData={projections.fiveYear}
              tenYearData={projections.tenYear}
              metricKey="totalProduction"
              title="Production"
              yAxisLabel="Total Production (kg)"
            />
            
            <ProjectionChart 
              twoYearData={projections.twoYear}
              fiveYearData={projections.fiveYear}
              tenYearData={projections.tenYear}
              metricKey="profitability"
              title="Profitability"
              yAxisLabel="Profit ($)"
            />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Projection Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">
                These projections compare your farm's performance under current management practices versus 
                implementing regenerative agriculture methods. The charts show estimated impacts over 2, 5, and 10 year horizons.
              </p>
              
              <h4 className="font-semibold mb-2">Key Findings:</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <span className="font-medium">Carbon Impact:</span>{" "}
                  Transitioning to regenerative practices could increase your carbon capture by approximately{" "}
                  {Math.round((carbon?.potentialCapture! / carbon?.currentCapture! - 1) * 100)}% while reducing emissions by{" "}
                  {Math.round((1 - carbon?.potentialEmissions! / carbon?.currentEmissions!) * 100)}%.
                </li>
                <li>
                  <span className="font-medium">Soil Health:</span>{" "}
                  Regenerative practices can improve soil health scores from{" "}
                  {pasture.soilHealthScore || 5} to {Math.min(10, (pasture.soilHealthScore || 5) * 1.5)} within 5 years.
                </li>
                <li>
                  <span className="font-medium">Production:</span>{" "}
                  Despite potentially lower stocking rates initially, total production can increase by{" "}
                  {Math.round(0.25 * 100)}% by year 5 due to improved animal health and weight gain.
                </li>
                <li>
                  <span className="font-medium">Profitability:</span>{" "}
                  Operating costs may increase initially during transition, but by year 3, profitability typically exceeds conventional methods due to reduced input costs and premium markets.
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="actions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map(action => (
              <ActionCard key={action.id} action={action} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default FarmDetails;
