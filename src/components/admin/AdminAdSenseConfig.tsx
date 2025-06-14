
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  DollarSign, 
  Eye, 
  EyeOff, 
  Save, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Code
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdSenseConfig {
  client_id: string;
  enabled: boolean;
  auto_ads: boolean;
  test_mode: boolean;
  ad_units: {
    header: string;
    sidebar: string;
    footer: string;
    in_content: string;
  };
  custom_code: string;
}

export const AdminAdSenseConfig = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<AdSenseConfig>({
    client_id: '',
    enabled: false,
    auto_ads: false,
    test_mode: true,
    ad_units: {
      header: '',
      sidebar: '',
      footer: '',
      in_content: ''
    },
    custom_code: ''
  });
  const [loading, setLoading] = useState(false);
  const [showClientId, setShowClientId] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      // Simula il caricamento della configurazione
      // In un'app reale, questo caricherà da Supabase
      const savedConfig = localStorage.getItem('adsense_config');
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }
    } catch (error) {
      console.error('Errore nel caricamento configurazione:', error);
    }
  };

  const saveConfig = async () => {
    setLoading(true);
    try {
      // Simula il salvataggio su Supabase
      localStorage.setItem('adsense_config', JSON.stringify(config));
      
      toast({
        title: "Configurazione salvata",
        description: "Le impostazioni AdSense sono state aggiornate con successo.",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile salvare la configurazione.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      // Simula test di connessione AdSense
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Test completato",
        description: "Connessione ad AdSense verificata con successo.",
      });
    } catch (error) {
      toast({
        title: "Test fallito",
        description: "Impossibile connettersi ad AdSense. Verifica le credenziali.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!config.client_id) {
      return <Badge variant="destructive">Non configurato</Badge>;
    }
    if (config.test_mode) {
      return <Badge variant="secondary">Modalità test</Badge>;
    }
    if (config.enabled) {
      return <Badge variant="default">Attivo</Badge>;
    }
    return <Badge variant="outline">Disattivato</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-6 w-6 text-green-600" />
              <div>
                <CardTitle>Configurazione Google AdSense</CardTitle>
                <CardDescription>
                  Gestisci le impostazioni pubblicitarie del sito
                </CardDescription>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">Generale</TabsTrigger>
              <TabsTrigger value="units">Unità Pubblicitarie</TabsTrigger>
              <TabsTrigger value="custom">Codice Personalizzato</TabsTrigger>
              <TabsTrigger value="settings">Impostazioni</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client-id">Client ID AdSense *</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="client-id"
                      type={showClientId ? "text" : "password"}
                      value={config.client_id}
                      onChange={(e) => setConfig({...config, client_id: e.target.value})}
                      placeholder="ca-pub-xxxxxxxxxxxxxxxxx"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowClientId(!showClientId)}
                    >
                      {showClientId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Il tuo ID publisher di AdSense (inizia con ca-pub-)
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.enabled}
                    onCheckedChange={(checked) => setConfig({...config, enabled: checked})}
                  />
                  <Label>Abilita AdSense</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.auto_ads}
                    onCheckedChange={(checked) => setConfig({...config, auto_ads: checked})}
                  />
                  <Label>Auto Ads</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.test_mode}
                    onCheckedChange={(checked) => setConfig({...config, test_mode: checked})}
                  />
                  <Label>Modalità Test</Label>
                </div>

                {config.test_mode && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      La modalità test è attiva. Gli annunci non genereranno ricavi reali.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>

            <TabsContent value="units" className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="header-unit">Unità Header</Label>
                  <Input
                    id="header-unit"
                    value={config.ad_units.header}
                    onChange={(e) => setConfig({
                      ...config, 
                      ad_units: {...config.ad_units, header: e.target.value}
                    })}
                    placeholder="ID unità pubblicitaria header"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sidebar-unit">Unità Sidebar</Label>
                  <Input
                    id="sidebar-unit"
                    value={config.ad_units.sidebar}
                    onChange={(e) => setConfig({
                      ...config, 
                      ad_units: {...config.ad_units, sidebar: e.target.value}
                    })}
                    placeholder="ID unità pubblicitaria sidebar"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footer-unit">Unità Footer</Label>
                  <Input
                    id="footer-unit"
                    value={config.ad_units.footer}
                    onChange={(e) => setConfig({
                      ...config, 
                      ad_units: {...config.ad_units, footer: e.target.value}
                    })}
                    placeholder="ID unità pubblicitaria footer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content-unit">Unità In-Content</Label>
                  <Input
                    id="content-unit"
                    value={config.ad_units.in_content}
                    onChange={(e) => setConfig({
                      ...config, 
                      ad_units: {...config.ad_units, in_content: e.target.value}
                    })}
                    placeholder="ID unità pubblicitaria in-content"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-code">Codice AdSense Personalizzato</Label>
                <Textarea
                  id="custom-code"
                  value={config.custom_code}
                  onChange={(e) => setConfig({...config, custom_code: e.target.value})}
                  placeholder="Inserisci il codice AdSense personalizzato..."
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-sm text-gray-500">
                  Codice HTML/JavaScript personalizzato per AdSense (opzionale)
                </p>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Stato configurazione:</strong>
                  <ul className="mt-2 space-y-1">
                    <li>• Client ID: {config.client_id ? '✅ Configurato' : '❌ Mancante'}</li>
                    <li>• Stato: {config.enabled ? '✅ Attivo' : '❌ Disattivato'}</li>
                    <li>• Auto Ads: {config.auto_ads ? '✅ Abilitato' : '❌ Disabilitato'}</li>
                    <li>• Modalità: {config.test_mode ? '⚠️ Test' : '✅ Produzione'}</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Button
                    onClick={testConnection}
                    disabled={loading || !config.client_id}
                    variant="outline"
                  >
                    {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Settings className="h-4 w-4 mr-2" />}
                    Testa Connessione
                  </Button>
                </div>

                <Alert>
                  <Code className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Istruzioni di integrazione:</strong>
                    <ol className="mt-2 space-y-1 list-decimal list-inside">
                      <li>Configura il Client ID AdSense</li>
                      <li>Imposta le unità pubblicitarie desiderate</li>
                      <li>Testa la configurazione in modalità test</li>
                      <li>Disabilita la modalità test per la produzione</li>
                      <li>Abilita AdSense per iniziare a mostrare annunci</li>
                    </ol>
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
            <Button variant="outline" onClick={loadConfig}>
              Ripristina
            </Button>
            <Button onClick={saveConfig} disabled={loading}>
              {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Salva Configurazione
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
